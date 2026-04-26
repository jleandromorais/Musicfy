import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaBox, FaTrash, FaEdit, FaPlus, FaSearch,
  FaSignOutAlt, FaBoxOpen, FaExclamationTriangle, FaTachometerAlt, FaChartBar,
  FaShoppingBag, FaUsers,
} from 'react-icons/fa';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

type Product = {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  is_active: boolean;
  imagem_url: string | null;
};
type Metrics = { total: number; active: number; out_of_stock: number };
type Stats = {
  by_category: { categoria: string; quantidade: number; valor_estoque: number; preco_medio: number }[];
  stock_distribution: { name: string; value: number; fill: string }[];
  top_stock: { nome: string; estoque: number }[];
  status_distribution: { name: string; value: number; fill: string }[];
};

const CAT_LABELS: Record<string, string> = {
  fones: 'Fones',
  headsets: 'Headsets',
  caixas_som: 'Caixas de Som',
  acessorios: 'Acessórios',
};

const CAT_COLORS = ['#f97316', '#35589A', '#a855f7', '#22c55e'];

const VIEWS = ['dashboard', 'produtos'] as const;
type View = typeof VIEWS[number];

// ── Custom tooltip ──────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      {label && <p className="text-gray-400 mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill || '#f97316' }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('valor')
            ? `R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const { adminUser, adminToken, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, active: 0, out_of_stock: 0 });
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const LIMIT = 10;

  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const fetchMetrics = useCallback(async () => {
    const res = await fetch(`${API}/admin/products/metrics`, { headers: authHeaders });
    if (res.ok) setMetrics(await res.json());
  }, [adminToken]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API}/admin/products/stats`, { headers: authHeaders });
      if (res.ok) setStats(await res.json());
    } finally { setLoadingStats(false); }
  }, [adminToken]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(LIMIT),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`${API}/admin/products/?${params}`, { headers: authHeaders });
      if (res.ok) { const d = await res.json(); setProducts(d.products); setTotal(d.total); }
    } finally { setLoading(false); }
  }, [page, debouncedSearch, adminToken]);

  useEffect(() => { fetchMetrics(); fetchStats(); }, [fetchMetrics, fetchStats]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: number, nome: string) => {
    if (!window.confirm(`Excluir "${nome}"?`)) return;
    const res = await fetch(`${API}/admin/products/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) { fetchProducts(); fetchMetrics(); fetchStats(); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  // Enriquecer dados de categoria com labels e cores
  const categoryChartData = stats?.by_category.map((c, i) => ({
    ...c,
    label: CAT_LABELS[c.categoria] ?? c.categoria,
    fill: CAT_COLORS[i % CAT_COLORS.length],
  })) ?? [];

  return (
    <div className="min-h-screen bg-[#1A002F] flex relative overflow-hidden">
      {/* bg glows */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full bg-[#F14A16] opacity-5 filter blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#35589A] opacity-10 filter blur-3xl pointer-events-none" />

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-black/40 backdrop-blur-sm border-r border-white/10 flex flex-col relative z-10 shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-extrabold text-white">Musicfy</h1>
          <span className="text-xs font-semibold text-orange-500 tracking-widest uppercase mt-0.5 block">Admin Panel</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { key: 'dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
            { key: 'produtos', icon: <FaBox />, label: 'Produtos' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key as View)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                view === key
                  ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {icon} {label}
            </button>
          ))}
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <FaShoppingBag /> Pedidos
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <FaUsers /> Usuários
          </Link>
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
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-auto relative z-10 min-w-0">
        {/* Header */}
        <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-white font-bold text-lg">
              {view === 'dashboard' ? 'Visão Geral' : 'Gestão de Produtos'}
            </h2>
            <p className="text-gray-500 text-xs">
              {view === 'dashboard' ? 'Analytics e métricas do catálogo' : 'Gerencie o catálogo da loja'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-400 text-sm">Online</span>
          </div>
        </header>

        {/* ── DASHBOARD VIEW ── */}
        {view === 'dashboard' && (
          <div className="p-8 space-y-6">
            {/* Metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard icon={<FaBox />} label="Total de Produtos" value={metrics.total} color="orange" glow="#F14A16" />
              <MetricCard icon={<FaBoxOpen />} label="Produtos Ativos" value={metrics.active} color="blue" glow="#35589A" />
              <MetricCard icon={<FaExclamationTriangle />} label="Sem Estoque" value={metrics.out_of_stock} color="red" glow="#ef4444" />
            </div>

            {loadingStats ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Carregando analytics...
                </div>
              </div>
            ) : (
              <>
                {/* Row 1: Bar chart categorias + Donut status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Bar: Produtos por categoria */}
                  <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <FaChartBar className="text-orange-500" />
                      <h3 className="text-white font-semibold">Produtos por Categoria</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={categoryChartData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="quantidade" name="Produtos" radius={[6, 6, 0, 0]}>
                          {categoryChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Donut: Ativo vs Inativo */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-semibold mb-5">Status do Catálogo</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={stats?.status_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {stats?.status_distribution.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<DarkTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {stats?.status_distribution.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.fill }} />
                            <span className="text-gray-400">{entry.name}</span>
                          </div>
                          <span className="text-white font-semibold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Top estoque + Distribuição de estoque */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Bar horizontal: top estoque */}
                  <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-semibold mb-5">Top Produtos em Estoque</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        layout="vertical"
                        data={stats?.top_stock}
                        margin={{ left: 0, right: 20 }}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="nome"
                          tick={{ fill: '#9ca3af', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={110}
                        />
                        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="estoque" name="Estoque" fill="#35589A" radius={[0, 6, 6, 0]}>
                          {stats?.top_stock.map((_, i) => (
                            <Cell
                              key={i}
                              fill={i === 0 ? '#f97316' : i === 1 ? '#fb923c' : '#35589A'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Donut: distribuição de estoque */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-semibold mb-5">Saúde do Estoque</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={stats?.stock_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {stats?.stock_distribution.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<DarkTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {stats?.stock_distribution.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: entry.fill }} />
                            <span className="text-gray-500">{entry.name}</span>
                          </div>
                          <span className="text-white font-semibold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 3: Valor de estoque por categoria (area chart) */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold">Valor de Estoque por Categoria</h3>
                    <span className="text-xs text-gray-500">preco × quantidade em estoque</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={categoryChartData}>
                      <defs>
                        <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<DarkTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="valor_estoque"
                        name="Valor em estoque"
                        stroke="#f97316"
                        strokeWidth={2.5}
                        fill="url(#gradOrange)"
                        dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#f97316' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Row 4: Preço médio por categoria */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-5">Preço Médio por Categoria</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={categoryChartData} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${v}`}
                      />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="preco_medio" name="Preço médio (R$)" radius={[6, 6, 0, 0]}>
                        {categoryChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PRODUTOS VIEW ── */}
        {view === 'produtos' && (
          <div className="p-8 space-y-6">
            {/* Mini metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard icon={<FaBox />} label="Total de Produtos" value={metrics.total} color="orange" glow="#F14A16" />
              <MetricCard icon={<FaBoxOpen />} label="Produtos Ativos" value={metrics.active} color="blue" glow="#35589A" />
              <MetricCard icon={<FaExclamationTriangle />} label="Sem Estoque" value={metrics.out_of_stock} color="red" glow="#ef4444" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-80">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all"
                />
              </div>
              <Link
                to="/admin/products/new"
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-600/20 text-sm whitespace-nowrap"
              >
                <FaPlus /> Adicionar Produto
              </Link>
            </div>

            {/* Table */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      {['Imagem', 'Nome', 'Categoria', 'Preço', 'Estoque', 'Status', 'Ações'].map((h) => (
                        <th key={h} className="px-5 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider last:text-right">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            Carregando produtos...
                          </div>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-16 text-gray-500">Nenhum produto encontrado.</td></tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-4">
                            {p.imagem_url ? (
                              <img
                                src={p.imagem_url.startsWith('/uploads')
                                  ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${p.imagem_url}`
                                  : p.imagem_url}
                                alt={p.nome}
                                className="w-11 h-11 object-cover rounded-xl border border-white/10"
                              />
                            ) : (
                              <div className="w-11 h-11 bg-gray-800 rounded-xl border border-white/10 flex items-center justify-center text-gray-600">
                                <FaBox />
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-white font-semibold">{p.nome}</td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#35589A]/20 text-[#7ba6f0] text-xs font-medium border border-[#35589A]/30">
                              {CAT_LABELS[p.categoria] ?? p.categoria}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-orange-400 font-semibold">R$ {p.preco.toFixed(2)}</td>
                          <td className="px-5 py-4">
                            <span className={`font-semibold ${p.estoque === 0 ? 'text-red-400' : p.estoque <= 5 ? 'text-yellow-400' : 'text-gray-300'}`}>
                              {p.estoque}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              p.is_active
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-gray-700/50 text-gray-500 border-gray-700'
                            }`}>
                              {p.is_active ? '● Ativo' : '○ Inativo'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/admin/products/${p.id}/edit`}
                                className="p-2 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={() => handleDelete(p.id, p.nome)}
                                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{total} produto(s)</span>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                          p === page
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                            : 'text-gray-500 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ── Metric Card ─────────────────────────────────────────────────
const MetricCard = ({
  icon, label, value, color, glow,
}: {
  icon: React.ReactNode; label: string; value: number;
  color: 'orange' | 'blue' | 'red'; glow: string;
}) => {
  const styles = {
    orange: 'bg-orange-600/15 text-orange-400 border-orange-500/20',
    blue: 'bg-[#35589A]/20 text-[#7ba6f0] border-[#35589A]/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <div className="relative bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-5 overflow-hidden group hover:border-white/20 transition-all">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${glow}15, transparent 60%)` }}
      />
      <div className="flex items-center gap-4 relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg border ${styles[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-xs font-medium">{label}</p>
          <p className="text-white text-2xl font-extrabold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
