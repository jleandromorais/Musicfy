// src/Pages/SuccessPage.tsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext'; // 1. Importar o useCart

const SuccessPage: React.FC = () => {
  const { clearCart } = useCart(); // 2. Obter a função para limpar o carrinho

  useEffect(() => {
    // 3. Este efeito é executado apenas uma vez quando a página carrega
    const completeOrder = () => {
      // Pega o pedido pendente do localStorage
      const pendingOrderString = localStorage.getItem('pendingOrder');
      if (!pendingOrderString) {
        console.warn("Nenhum pedido pendente encontrado para ser concluído.");
        return;
      }

      const pendingOrder = JSON.parse(pendingOrderString);

      // Pega a lista de todos os pedidos já feitos (ou cria uma nova)
      const allOrdersString = localStorage.getItem('allOrders');
      const allOrders = allOrdersString ? JSON.parse(allOrdersString) : [];

      // Adiciona o novo pedido à lista
      allOrders.push(pendingOrder);

      // Salva a lista atualizada de pedidos
      localStorage.setItem('allOrders', JSON.stringify(allOrders));

      // Remove o pedido pendente, pois ele já foi processado
      localStorage.removeItem('pendingOrder');
      
      // Limpa o carrinho de compras
      clearCart();
    };

    completeOrder();
  }, [clearCart]); // A dependência garante que a função `clearCart` esteja disponível

  return (
    <div className="bg-[#1A002F] text-white min-h-screen flex items-center justify-center p-4">
      <div className="text-center bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-green-500 mb-4">Pagamento bem-sucedido!</h1>
        <p className="text-gray-400 mb-8">
          O seu pedido foi confirmado e agora pode ser visto no seu histórico.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/orders"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Ver Meus Pedidos
            </Link>
            <Link
              to="/"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Continuar a Comprar
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;