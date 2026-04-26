import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignOutAlt, FaBox, FaTachometerAlt, FaShoppingBag, FaUsers, FaSearch, FaUserShield, FaUser } from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

type AppUser = {
  id: number;
  nome: string;
  email: string;
  firebaseUid: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
};

const LIMIT = 10;

const AdminUsers: React.FC = () => {
  const { adminUser, adminToken, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (debouncedSearch) params.append('search', debouncedSearch);
      const res = await fetch(`${API}/admin/users/?${params}`, { headers: authHeaders });
      if (res.ok) { const d = await res.json(); setUsers(d.users); setTotal(d.total); }
    } finally { setLoading(false); }
  }, [page, debouncedSearch, adminToken]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (userId: number) => {
    const res = await fetch(`${API}/admin/users/${userId}/toggle-active`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    if (res.ok) fetchUsers();
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#1A002F] flex relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#F14A16] opacity-5 filter blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#35589A] opacity-10 filter blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-60 bg-black/40 backdrop-blur-sm border-r border-white/10 flex flex-col relative z-10 shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-extrabold text-white">Musicfy</h1>
          <span className="text-xs font-semibold text-orange-500 tracking-widest uppercase mt-0.5 block">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <FaTachometerAlt /> Dashboard
          </Link>
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <FaBox /> Produtos
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <FaShoppingBag /> Pedidos
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-600/20 text-orange-400 border border-orange-500/20">
            <FaUsers /> Usuários
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-600/30 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold">
              {adminUser?.nome?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{adminUser?.nome}</p>
              <p className="text-gray-500 text-xs truncate">{adminUser?.email}</p>
            </div>
          </div>
          <button onClick={() => { logoutAdmin(); navigate('/admin/login'); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors">
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-auto relative z-10">
        <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-white font-bold text-lg">Usuários</h2>
            <p className="text-gray-500 text-xs">Visualize e gerencie os usuários cadastrados</p>
          </div>
          <span className="text-gray-500 text-sm">Olá, {adminUser?.nome}</span>
        </header>

        <div className="p-8 space-y-5">
          {/* Busca */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all"
              />
            </div>
            <span className="text-gray-500 text-sm whitespace-nowrap">{total} usuário(s)</span>
          </div>

          {/* Tabela */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {['Usuário', 'E-mail', 'Tipo', 'Cadastro', 'Status', 'Ação'].map(h => (
                    <th key={h} className="px-5 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Carregando usuários...
                    </div>
                  </td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-500">Nenhum usuário encontrado.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${u.isAdmin ? 'bg-orange-600/20 text-orange-400 border-orange-500/30' : 'bg-gray-800 text-gray-400 border-white/10'}`}>
                          {u.nome?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{u.email}</td>
                    <td className="px-5 py-4">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-600/15 text-orange-400 border border-orange-500/20">
                          <FaUserShield className="text-xs" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#35589A]/20 text-[#7ba6f0] border border-[#35589A]/30">
                          <FaUser className="text-xs" /> Usuário
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${u.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-700/50 text-gray-500 border-gray-700'}`}>
                        {u.isActive ? '● Ativo' : '○ Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        disabled={u.isAdmin}
                        title={u.isAdmin ? 'Não é possível desativar um admin' : u.isActive ? 'Desativar conta' : 'Ativar conta'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          u.isAdmin
                            ? 'opacity-30 cursor-not-allowed bg-gray-800 text-gray-500 border-gray-700'
                            : u.isActive
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                              : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        }`}
                      >
                        {u.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-gray-500 text-sm">{total} usuário(s)</span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${p === page ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
