import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignOutAlt, FaBox, FaTachometerAlt, FaShoppingBag, FaUsers } from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

type OrderItem = { productName: string; quantity: number; unitPrice: number };
type Order = {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: string;
  statusLabel: string;
  shippingAddress: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending',   label: 'Aguardando pagamento' },
  { value: 'paid',      label: 'Pago — em separação' },
  { value: 'shipped',   label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  paid:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped:   'bg-[#35589A]/20 text-[#7ba6f0] border-[#35589A]/30',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-gray-700/50 text-gray-500 border-gray-700',
};

const LIMIT = 10;

const AdminOrders: React.FC = () => {
  const { adminUser, adminToken, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`${API}/admin/orders/?${params}`, { headers: authHeaders });
      if (res.ok) { const d = await res.json(); setOrders(d.orders); setTotal(d.total); }
    } finally { setLoading(false); }
  }, [page, statusFilter, adminToken]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const res = await fetch(`${API}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchOrders();
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
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-orange-600/20 text-orange-400 border border-orange-500/20">
            <FaShoppingBag /> Pedidos
          </div>
          <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
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
          <button onClick={() => { logoutAdmin(); navigate('/admin/login'); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors">
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-auto relative z-10">
        <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-white font-bold text-lg">Pedidos</h2>
            <p className="text-gray-500 text-xs">Gerencie e atualize o status dos pedidos</p>
          </div>
          <span className="text-gray-500 text-sm">Olá, {adminUser?.nome}</span>
        </header>

        <div className="p-8 space-y-5">
          {/* Filtro de status */}
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  statusFilter === opt.value
                    ? 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                    : 'bg-black/20 text-gray-500 border-white/10 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="ml-auto text-gray-500 text-sm self-center">{total} pedido(s)</span>
          </div>

          {/* Tabela */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {['Pedido', 'Cliente', 'Data', 'Total', 'Status', 'Ações'].map(h => (
                    <th key={h} className="px-5 py-4 text-gray-500 font-semibold text-xs uppercase tracking-wider last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Carregando pedidos...
                    </div>
                  </td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-500">Nenhum pedido encontrado.</td></tr>
                ) : orders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      <td className="px-5 py-4 text-white font-semibold">#{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-white text-sm">{order.customerName}</p>
                        <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-sm">
                        {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4 text-orange-400 font-semibold">
                        R$ {order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_STYLE[order.status] ?? 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                          {order.statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <select
                          value={order.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          {STATUS_OPTIONS.filter(o => o.value).map(o => (
                            <option key={o.value} value={o.value} className="bg-gray-800">{o.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {/* Itens expandidos */}
                    {expanded === order.id && (
                      <tr>
                        <td colSpan={6} className="px-5 pb-4 bg-black/20">
                          <div className="pt-3 space-y-1.5 border-t border-white/5">
                            <p className="text-gray-500 text-xs mb-2">Endereço: {order.shippingAddress}</p>
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm text-gray-400">
                                <span>{item.quantity}× {item.productName}</span>
                                <span className="text-gray-300">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-gray-500 text-sm">{total} pedido(s)</span>
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

export default AdminOrders;
