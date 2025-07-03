// src/Pages/OrdersPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaArrowLeft, FaBoxOpen, FaShoppingBag, FaCalendarAlt } from 'react-icons/fa'; // 1. Importar ícone de calendário
import DeliveryStatus from '../components/DeliveryStatus';
import { calculateEstimatedDelivery } from '../services/dateService'; // 2. Importar a nova função

// Atualizar o tipo para incluir os dados necessários
type Order = {
  id: string;
  date: string;
  totalPrice: number;
  shipping: { 
    name?: string;
    estimatedTime?: string; // Adicionar este campo
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryStatus: string;
  deliveryPerson: {
    name: string;
    avatar: string;
  };
};

const OrdersPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }
    
    const storedOrdersString = localStorage.getItem('allOrders');
    if (storedOrdersString) {
      const allStoredOrders = JSON.parse(storedOrdersString);
      const userOrders = allStoredOrders.filter((order: any) => order.userId === currentUser?.uid);

      const ordersWithStatus = userOrders.map((order: any, index: number) => {
        const statuses = ['Pedido recebido', 'Em separação', 'Saiu para entrega', 'A caminho', 'Entregue'];
        
        return {
          ...order,
          deliveryStatus: statuses[index % statuses.length], 
          deliveryPerson: {
            name: 'Carlos Estevão',
            avatar: `https://i.pravatar.cc/150?u=${order.id}`,
          },
        };
      });
      
      setOrders(ordersWithStatus);
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A002F] text-white">Carregando...</div>;
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
            {orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((order) => {
              // 3. Chamar a função para calcular a data
              const estimatedDelivery = order.shipping.estimatedTime 
                ? calculateEstimatedDelivery(order.date, order.shipping.estimatedTime) 
                : 'A ser definido';
              
              return (
                <div key={order.id} className="bg-gray-800 rounded-lg shadow-xl p-6">
                  {/* ... (código dos detalhes do pedido) ... */}
                  <div className="flex flex-wrap justify-between items-center border-b border-gray-700 pb-3 mb-3 gap-2">
                    <div>
                      <h2 className="text-lg font-bold">Pedido #{order.id.replace('order_', '')}</h2>
                      <p className="text-sm text-gray-400">Data: {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-xl font-bold text-orange-400">
                      R$ {order.totalPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* ... (código dos itens) ... */}
                   <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-gray-300">
                          <span>{item.quantity}x {item.name}</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-gray-400 text-sm pt-2 border-t border-gray-700/50 mt-2">
                          <span>Frete: {order.shipping?.name}</span>
                      </div>
                  </div>

                  {/* 4. Exibir a data de entrega estimada */}
                  <div className="flex items-center gap-2 text-green-400 text-sm mt-4 font-semibold">
                      <FaCalendarAlt />
                      <span>{estimatedDelivery}</span>
                  </div>

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