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

      if (fbUser) {
        try {
          // 1. Tenta buscar o usuário no backend
          let buscarResponse = await fetch(`http://localhost:8080/api/usuario/firebase/${fbUser.uid}`);

          // 2. Se não existir (404), cria o usuário
          if (buscarResponse.status === 404) {
            const criarResponse = await fetch('http://localhost:8080/api/usuario/criar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebaseUid: fbUser.uid,
                fullName: fbUser.displayName ?? 'Usuário',
                email: fbUser.email ?? '',
              }),
            });

            if (!criarResponse.ok) {
              throw new Error(`Erro ao criar usuário: ${await criarResponse.text()}`);
            }

            // Rebuscar após criar
            buscarResponse = await fetch(`http://localhost:8080/api/usuario/firebase/${fbUser.uid}`);
            if (!buscarResponse.ok) {
              throw new Error(`Erro ao buscar usuário depois de criar: ${await buscarResponse.text()}`);
            }
          }

          // 3. Definir usuário no estado
          const userData: AppUser = await buscarResponse.json();
          setCurrentUser(userData);

        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : 'Erro desconhecido ao autenticar usuário.';
          console.error('[useAuth] erro:', errorMessage);
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
