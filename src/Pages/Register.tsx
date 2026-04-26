import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface FirebaseError extends Error {
  code: string;
}

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/', { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Nome obrigatório.';
    if (!email.trim()) errors.email = 'E-mail obrigatório.';
    if (password.length < 6) errors.password = 'Senha deve ter pelo menos 6 caracteres.';
    if (password !== confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const registerInBackend = async (uid: string, displayName: string, userEmail: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/usuario/criar`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: uid, fullName: displayName, email: userEmail }),
      }
    );
    if (!res.ok && res.status !== 409) {
      console.warn('Erro ao sincronizar usuário no backend.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName });
      await registerInBackend(credential.user.uid, fullName, email);
      navigate('/login', {
        state: { successMessage: 'Conta criada com sucesso! Faça login.' },
      });
    } catch (err) {
      const fbErr = err as FirebaseError;
      switch (fbErr.code) {
        case 'auth/email-already-in-use':
          setFieldErrors((prev) => ({ ...prev, email: 'E-mail já está em uso.' }));
          break;
        case 'auth/weak-password':
          setFieldErrors((prev) => ({ ...prev, password: 'Senha fraca. Use pelo menos 6 caracteres.' }));
          break;
        case 'auth/invalid-email':
          setFieldErrors((prev) => ({ ...prev, email: 'E-mail inválido.' }));
          break;
        default:
          setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#1A002F] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#F14A16] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/3 left-1/4 w-[800px] h-[800px] rounded-full bg-[#35589A] opacity-20 filter blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-md w-full space-y-6 bg-black/30 backdrop-blur-md p-10 rounded-xl shadow-2xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-semibold"
        >
          <FaArrowLeft />
          Voltar para Login
        </Link>

        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">Get started with your account</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Nome */}
          <div>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nome completo"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-12 p-3 rounded-md bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  fieldErrors.fullName ? 'border-red-500' : 'border-gray-700'
                }`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="E-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 p-3 rounded-md bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-700'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Senha"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 p-3 rounded-md bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-700'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Confirmar senha"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-12 p-3 rounded-md bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-md border border-red-500/20 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-md text-white bg-orange-600 hover:bg-orange-700 font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-orange-400 hover:text-orange-500 transition-colors"
          >
            Já tem uma conta? Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
