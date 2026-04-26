import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginAdmin, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Acesso negado. Verifique suas credenciais.');
        return;
      }
      const data = await res.json();
      loginAdmin(data.access_token, data.admin);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#1A002F] flex items-center justify-center px-4 overflow-hidden">
      {/* Glow bg */}
      <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] rounded-full bg-[#F14A16] opacity-10 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full bg-[#35589A] opacity-15 filter blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-600/20 border border-orange-500/30 mb-4">
            <FaShieldAlt className="text-orange-400 text-2xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Musicfy <span className="text-orange-500">Admin</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Área administrativa — acesso restrito</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30"
            >
              {loading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Acesso restrito a administradores autorizados
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
