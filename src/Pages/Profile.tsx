import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaShoppingBag, FaShoppingCart,
  FaEdit, FaCheck, FaTimes, FaSignOutAlt, FaCalendarAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { updateProfile } from 'firebase/auth';
import Navbar from '../components/NavbarE';
import Footer from '../components/footer';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

type OrderDTO = {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: string;
  items: { productName: string; quantity: number }[];
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:          { label: 'Aguardando pagamento', color: 'text-yellow-400' },
  PROCESSING:       { label: 'Em separação',          color: 'text-blue-400'   },
  SHIPPED:          { label: 'Enviado',                color: 'text-[#7ba6f0]' },
  OUT_FOR_DELIVERY: { label: 'Saiu para entrega',      color: 'text-purple-400' },
  DELIVERED:        { label: 'Entregue',               color: 'text-green-400' },
  CANCELLED:        { label: 'Cancelado',              color: 'text-gray-500'  },
};

const Profile: React.FC = () => {
  const { currentUser, firebaseUser, logout } = useAuth();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API}/orders/user/${firebaseUser.uid}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoadingOrders(false);
    }
  }, [firebaseUser?.uid]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const startEdit = () => {
    setNewName(currentUser?.fullName || firebaseUser?.displayName || '');
    setEditingName(true);
  };

  const cancelEdit = () => setEditingName(false);

  const saveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed || !currentUser?.id || !auth.currentUser) return;
    setSavingName(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`${API}/usuario/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ fullName: trimmed }),
      });
      if (!res.ok) throw new Error();

      // Atualiza também no Firebase
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      }

      toast.success('Nome atualizado com sucesso!');
      setEditingName(false);
    } catch {
      toast.error('Erro ao atualizar nome. Tente novamente.');
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const memberSince = currentUser
    ? null
    : firebaseUser?.metadata?.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : null;

  const displayName = currentUser?.fullName || firebaseUser?.displayName || 'Usuário';
  const initials = displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#1A002F] text-white">
      <Navbar />

      {/* bg glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#F14A16] opacity-5 filter blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#35589A] opacity-10 filter blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 space-y-8">

        {/* Card principal */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={displayName}
                  className="w-24 h-24 rounded-full border-2 border-orange-500/50 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-600/20 border-2 border-orange-500/50 flex items-center justify-center text-3xl font-extrabold text-orange-400">
                  {initials}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full border-2 border-[#1A002F]" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              {/* Nome */}
              {editingName ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEdit(); }}
                    className="bg-gray-800 border border-gray-600 text-white rounded-xl px-3 py-1.5 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 w-full max-w-xs"
                  />
                  <button onClick={saveName} disabled={savingName} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all">
                    <FaCheck size={14} />
                  </button>
                  <button onClick={cancelEdit} className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition-all">
                    <FaTimes size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-extrabold text-white">{displayName}</h1>
                  <button onClick={startEdit} className="p-1.5 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all" title="Editar nome">
                    <FaEdit size={14} />
                  </button>
                </div>
              )}

              {/* Email */}
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-center sm:justify-start">
                <FaEnvelope size={12} />
                <span>{currentUser?.email || firebaseUser?.email}</span>
              </div>

              {/* Membro desde */}
              {memberSince && (
                <div className="flex items-center gap-2 text-gray-500 text-xs justify-center sm:justify-start">
                  <FaCalendarAlt size={11} />
                  <span>Membro desde {memberSince}</span>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors shrink-0"
            >
              <FaSignOutAlt /> Sair
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-orange-600/10 border border-orange-500/20 rounded-2xl p-4 text-center">
              <p className="text-3xl font-extrabold text-orange-400">{orders.length}</p>
              <p className="text-gray-400 text-sm mt-1">Pedidos realizados</p>
            </div>
            <div className="bg-[#35589A]/10 border border-[#35589A]/20 rounded-2xl p-4 text-center">
              <p className="text-3xl font-extrabold text-[#7ba6f0]">
                R$ {orders.reduce((s, o) => s + o.totalPrice, 0).toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm mt-1">Total em compras</p>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/orders"
            className="bg-black/30 backdrop-blur-sm border border-white/10 hover:border-orange-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-600/15 text-orange-400 flex items-center justify-center text-xl group-hover:bg-orange-600/25 transition-all">
              <FaShoppingBag />
            </div>
            <div>
              <p className="text-white font-semibold">Meus Pedidos</p>
              <p className="text-gray-500 text-xs">Ver histórico completo</p>
            </div>
          </Link>

          <Link
            to="/cart"
            className="bg-black/30 backdrop-blur-sm border border-white/10 hover:border-orange-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#35589A]/20 text-[#7ba6f0] flex items-center justify-center text-xl group-hover:bg-[#35589A]/30 transition-all">
              <FaShoppingCart />
            </div>
            <div>
              <p className="text-white font-semibold">Carrinho</p>
              <p className="text-gray-500 text-xs">Ver itens salvos</p>
            </div>
          </Link>
        </div>

        {/* Pedidos recentes */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-lg">Pedidos Recentes</h2>
            {orders.length > 3 && (
              <Link to="/orders" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                Ver todos →
              </Link>
            )}
          </div>

          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <FaShoppingBag className="text-4xl mx-auto mb-3 opacity-30" />
              <p>Você ainda não fez nenhum pedido.</p>
              <Link to="/" className="text-orange-400 hover:text-orange-300 text-sm mt-2 inline-block transition-colors">
                Explorar produtos →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const st = STATUS_LABEL[order.status] ?? { label: order.status, color: 'text-gray-400' };
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                    <div>
                      <p className="text-white font-semibold text-sm">Pedido #{order.id}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {order.items.slice(0, 2).map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} itens`}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-orange-400 font-bold text-sm">R$ {order.totalPrice.toFixed(2)}</p>
                      <p className={`text-xs mt-0.5 ${st.color}`}>{st.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
