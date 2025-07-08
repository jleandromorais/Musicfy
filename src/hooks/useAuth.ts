// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import type { User as AppUser } from '../types/User';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setError(null);
      setLoading(true);

      if (fbUser) {
        try {
          // Obtenha o ID Token do Firebase User
          const idToken = await fbUser.getIdToken(); 
          console.log('[useAuth] Firebase ID Token obtido:', idToken); // Apenas para depuração

          let backendUser: AppUser | null = null;

          // 1. Tentar buscar usuário no backend usando o Firebase UID
          let buscarResponse = await fetch(`http://localhost:8080/api/usuario/firebase/${fbUser.uid}`, {
            headers: {
              'Authorization': `Bearer ${idToken}`, // Adicione o ID Token aqui
              'Content-Type': 'application/json' // Garanta este header para JSON requests
            }
          });
          
          if (buscarResponse.ok) {
            backendUser = await buscarResponse.json();
            console.log('[useAuth] Usuário encontrado no backend:', backendUser);
          } else if (buscarResponse.status === 404) {
            console.log('[useAuth] Usuário não encontrado no backend, tentando criar...');
            // 2. Se o usuário não existir (404), tenta criá-lo no backend
            const criarResponse = await fetch('http://localhost:8080/api/usuario/criar', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${idToken}`, // Adicione o ID Token aqui também
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                firebaseUid: fbUser.uid,
                fullName: fbUser.displayName ?? 'Usuário',
                email: fbUser.email ?? '',
              }),
            });

            if (!criarResponse.ok) {
              const errorText = await criarResponse.text();
              throw new Error(`Erro ao criar usuário no backend: ${errorText}`);
            }

            backendUser = await criarResponse.json();
            console.log('[useAuth] Usuário criado no backend:', backendUser);

            // Caso o backend de 'criar' não retorne o ID, fazemos outra busca
            if (!backendUser || backendUser.id === undefined || backendUser.id === null) {
              console.warn('[useAuth] Usuário criado não retornou ID, re-buscando...');
              const rebuscarResponse = await fetch(`http://localhost:8080/api/usuario/firebase/${fbUser.uid}`, {
                headers: {
                  'Authorization': `Bearer ${idToken}`, // Adicione o ID Token na re-busca
                  'Content-Type': 'application/json'
                }
              });
              if (!rebuscarResponse.ok) {
                throw new Error(`Erro ao re-buscar usuário depois de criar: ${await rebuscarResponse.text()}`);
              }
              backendUser = await rebuscarResponse.json();
              console.log('[useAuth] Usuário re-buscado (fallback):', backendUser);
            }

          } else {
            throw new Error(`Erro ao buscar usuário no backend (HTTP ${buscarResponse.status}): ${await buscarResponse.text()}`);
          }

          if (backendUser && backendUser.id !== undefined && backendUser.id !== null) {
            setCurrentUser(backendUser);
          } else {
            console.error('[useAuth] Usuário do backend não possui ID válido:', backendUser);
            throw new Error('Dados do usuário incompletos: ID não fornecido pelo backend.');
          }

        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : 'Erro desconhecido ao autenticar usuário.';
          console.error('[useAuth] Erro no fluxo de autenticação/backend:', errorMessage);
          setError(errorMessage);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      setError(null);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Erro desconhecido ao sair da conta.';
      setError(errorMessage);
    }
  };

  return { currentUser, firebaseUser, loading, error, logout };
};