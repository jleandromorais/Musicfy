import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const SuccessPage: React.FC = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

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
