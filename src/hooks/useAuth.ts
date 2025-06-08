// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth'; // Importação type-only
import { auth } from '../firebase';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            if (!auth) {
                throw new Error('Firebase Auth não está inicializado');
            }

            const unsubscribe = onAuthStateChanged(
                auth, 
                (user) => {
                    setCurrentUser(user);
                    setLoading(false);
                    setError(null);
                },
                (authError) => {
                    setError(`Erro de autenticação: ${authError.message}`);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
            setLoading(false);
        }
    }, []);

    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            setCurrentUser(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no logout';
            setError(errorMessage);
            console.error("Erro no logout:", error);
        } finally {
            setLoading(false);
        }
    };

    return { 
        currentUser, 
        loading, 
        error,
        logout 
    };
};