import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  // ❌ Remover o User daqui
} from 'firebase/auth';

import type { User } from 'firebase/auth'; // ✅ Mantém só esse


import { useNavigate } from 'react-router-dom';

interface FirebaseError extends Error {
    code: string;
    message: string;
}

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    // ✅ NOVA função: envia apenas o DTO sem token
    const registerUserInBackend = async (user: User) => {
        try {
            const userDTO = {
                firebaseUid: user.uid,
                fullName: user.displayName || fullName,
                email: user.email || email
            };

            const response = await fetch('http://localhost:8080/api/usuario/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userDTO)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to register user in backend');
            }

            return await response.text();
        } catch (error) {
            console.error('Backend registration error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    try {
                        await registerUserInBackend(result.user);
                        navigate('/');
                    } catch {
                        setError('Failed to register user in backend');
                    }
                }
            } catch (error) {
                console.error("Redirect error:", error);
            }
        };
        handleRedirectResult();
    }, [navigate]);

    const toggleView = () => setIsLoginView(!isLoginView);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            try {
                const result = await signInWithPopup(auth, provider);
                await registerUserInBackend(result.user);
                navigate('/');
            } catch (popupError) {
                if ((popupError as FirebaseError).code === 'auth/popup-blocked') {
                    await signInWithRedirect(auth, provider);
                } else {
                    throw popupError;
                }
            }
        } catch (error) {
            const err = error as FirebaseError;
            let errorMessage = 'Failed to sign in with Google';
            if (err.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login popup was closed before completing';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (userCredential.user) {
                    await updateProfile(userCredential.user, {
                        displayName: fullName
                    });

                    await registerUserInBackend(userCredential.user);
                }
                navigate('/');
            }
        } catch (error) {
            const err = error as FirebaseError;
            switch (err.code) {
                case 'auth/user-not-found':
                    setError("Nenhum usuário encontrado com este e-mail.");
                    break;
                case 'auth/wrong-password':
                    setError("Senha incorreta. Por favor, tente novamente.");
                    break;
                case 'auth/invalid-credential':
                    setError("Credenciais inválidas. Verifique seu e-mail e senha.");
                    break;
                case 'auth/email-already-in-use':
                    setError("Este e-mail já está em uso por outra conta.");
                    break;
                case 'auth/weak-password':
                    setError("A senha deve ter pelo menos 6 caracteres.");
                    break;
                default:
                    setError("Falha na autenticação. Tente novamente.");
                    console.error('Auth error:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#1A002F] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#F14A16] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/3 left-1/4 w-[800px] h-[800px] rounded-full bg-[#35589A] opacity-20 filter blur-3xl animate-pulse"></div>

            <div className="relative z-10 max-w-md w-full space-y-6 bg-black/30 backdrop-blur-md p-10 rounded-xl shadow-2xl">
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold text-white">
                        {isLoginView ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {isLoginView ? 'Sign in to continue' : 'Get started with your account'}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleEmailPasswordSubmit}>
                    {!isLoginView && (
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                placeholder="Full Name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-12 p-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 p-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 p-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-md text-white bg-orange-600 hover:bg-orange-700 font-medium transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="flex items-center justify-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-600 rounded-md text-white bg-gray-800 hover:bg-gray-700 font-medium transition-colors"
                >
                    <FcGoogle size={22} />
                    <span>Continue with Google</span>
                </button>

                {error && (
                    <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-md border border-red-500/20 text-center">
                        {error}
                    </div>
                )}

                <div className="text-sm text-center">
                    <button
                        onClick={toggleView}
                        className="font-medium text-orange-400 hover:text-orange-500 transition-colors"
                        disabled={loading}
                    >
                        {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
