import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaArrowLeft, FaBoxOpen, FaShoppingBag, FaCalendarAlt } from 'react-icons/fa';
import DeliveryStatus from '../components/DeliveryStatus';
import { calculateEstimatedDelivery } from '../services/dateService';
import { toast } from 'react-toastify';

// Tipos vindos do backend
type OrderItemDTO = {
  productId: number;
  productName: string;
  productImgPath: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type OrderDTO = {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  items: OrderItemDTO[];
};

// Tipo do frontend
type Order = {
  id: string;
  date: string;
  totalPrice: number;
  shipping: {
    name?: string;
    estimatedTime?: string;
  };
  items: Array<{
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  deliveryStatus: string;
  deliveryPerson: {
    name: string;
    avatar: string;
  };
};

const mapOrderStatus = (status: OrderDTO['status']): string => {
  const statusMap = {
    PENDING: 'Pedido recebido',
    PROCESSING: 'Em separação',
    SHIPPED: 'Enviado',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  };
  return statusMap[status] || 'Status desconhecido';
};

const OrdersPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://back-musicfy-origin-3.onrender.com/api/orders/user/${currentUser.firebaseUid}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);
      }

      const data: OrderDTO[] = await response.json();

      const mappedOrders: Order[] = data.map(orderDto => ({
        id: orderDto.id.toString(),
        date: orderDto.orderDate,
        totalPrice: orderDto.totalPrice,
        deliveryStatus: mapOrderStatus(orderDto.status),
        items: orderDto.items.map(item => ({
          name: item.productName,
          image: item.productImgPath,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        shipping: {
          name: 'Frete Padrão',
          estimatedTime: '5-7 dias',
        },
        deliveryPerson: {
          name: 'Carlos Estevão',
          avatar: `https://i.pravatar.cc/150?u=${orderDto.id}`,
        },
      }));

      setOrders(mappedOrders);
    } catch (err: any) {
      console.error("Falha ao buscar pedidos:", err);
      setError("Não foi possível carregar seus pedidos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        navigate('/login');
      } else {
        fetchOrders();
      }
    }
  }, [currentUser, authLoading, navigate, fetchOrders]);

  // Função para cancelar pedido
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar este pedido?")) return;

    try {
      const response = await fetch(`https://back-musicfy-origin-3.onrender.com/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        // Remove o pedido cancelado da lista localmente
        setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        toast.success('Pedido cancelado com sucesso!');
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao cancelar pedido: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (err) {
      toast.error('Erro ao cancelar pedido. Tente novamente mais tarde.');
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A002F] text-white">Carregando seus pedidos...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A002F] text-red-400">{error}</div>;
  }

  return (
    <div className="bg-[#1A002F] text-white min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#35589A] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors mb-6 font-semibold w-fit"
        >
          <FaArrowLeft />
          Voltar para a Loja
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-8 flex items-center gap-4">
          <FaShoppingBag /> Meus Pedidos
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
            <FaBoxOpen className="text-6xl text-gray-500 mx-auto mb-4" />
            <p className="text-xl text-gray-400">Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(order => {
                const estimatedDelivery = order.shipping.estimatedTime
                  ? calculateEstimatedDelivery(order.date, order.shipping.estimatedTime)
                  : 'A ser definido';

                return (
                  <div key={order.id} className="bg-gray-800 rounded-lg shadow-xl p-6">
                    <div className="flex flex-wrap justify-between items-center border-b border-gray-700 pb-3 mb-3 gap-2">
                      <div>
                        <h2 className="text-lg font-bold">Pedido #{order.id}</h2>
                        <p className="text-sm text-gray-400">
                          Data: {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-xl font-bold text-orange-400">
                        R$ {order.totalPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-gray-300">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-gray-400 text-sm pt-2 border-t border-gray-700/50 mt-2">
                        <span>Frete: {order.shipping?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-green-400 text-sm mt-4 font-semibold">
                      <FaCalendarAlt />
                      <span>{estimatedDelivery}</span>
                    </div>

                    {/* Botão Cancelar Pedido */}
                    {order.deliveryStatus !== 'Cancelado' && order.deliveryStatus !== 'Entregue' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Cancelar Pedido
                      </button>
                    )}

                    <DeliveryStatus
                      currentStatus={order.deliveryStatus}
                      deliveryPerson={order.deliveryPerson}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
