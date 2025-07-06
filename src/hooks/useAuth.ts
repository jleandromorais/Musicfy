import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import type { User as AppUser } from '../types/User'; // <-- Seu tipo com id

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await fetch(`http://localhost:8080/api/users/firebase/${firebaseUser.uid}`);
          const userData: AppUser = await response.json();
          setCurrentUser(userData); // ✅ Agora contém id, nome, email, etc.
        } catch (e) {
          setError('Erro ao buscar usuário');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  return { currentUser, loading, error, logout };
};
