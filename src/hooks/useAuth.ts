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
      if (fbUser) {
        try {
          const response = await fetch(`http://localhost:8080/api/usuario/firebase/${fbUser.uid}`);
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Falha ao buscar dados do usuário no backend: ${response.status} - ${errorData}`);
          }
          const userData: AppUser = await response.json();
          setCurrentUser(userData);
        } catch (e) {
          setError('Erro ao buscar usuário do backend.');
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
    } catch (e) {
      setError('Erro ao sair da conta.');
    }
  };

  return { currentUser, firebaseUser, loading, error, logout };
};