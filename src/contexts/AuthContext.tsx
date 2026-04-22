import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import type { User as AppUser } from '../types/User';

type AuthContextType = {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const BASE_API = 'https://back-musicfy-origin-3.onrender.com/api/usuario';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setError(null);
      setLoading(true);

      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const headers = {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          };

          let backendUser: AppUser | null = null;

          const buscarResponse = await fetch(`${BASE_API}/firebase/${fbUser.uid}`, { headers });

          if (buscarResponse.ok) {
            backendUser = await buscarResponse.json();
          } else if (buscarResponse.status === 404) {
            const criarResponse = await fetch(`${BASE_API}/criar`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                firebaseUid: fbUser.uid,
                fullName: fbUser.displayName ?? 'Usuário',
                email: fbUser.email ?? '',
              }),
            });

            if (!criarResponse.ok) {
              throw new Error(`Erro ao criar usuário: ${await criarResponse.text()}`);
            }

            backendUser = await criarResponse.json();

            // Fallback: se o endpoint de criação não retornar o id, rebusca
            if (!backendUser?.id) {
              const rebuscarResponse = await fetch(`${BASE_API}/firebase/${fbUser.uid}`, { headers });
              if (!rebuscarResponse.ok) {
                throw new Error(`Erro ao re-buscar usuário: ${await rebuscarResponse.text()}`);
              }
              backendUser = await rebuscarResponse.json();
            }
          } else {
            throw new Error(`Erro ao buscar usuário (HTTP ${buscarResponse.status})`);
          }

          if (backendUser?.id != null) {
            setCurrentUser(backendUser);
          } else {
            throw new Error('Dados do usuário incompletos: ID não fornecido pelo backend.');
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Erro desconhecido ao autenticar.';
          console.error('[AuthContext]', msg);
          setError(msg);
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
      const msg = e instanceof Error ? e.message : 'Erro desconhecido ao sair.';
      setError(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
