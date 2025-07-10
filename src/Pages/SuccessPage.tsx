// src/Pages/SuccessPage.tsx

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

// Estados para controlar o processo de verificação
type VerificationStatus = 'verifying' | 'success' | 'error';

const SuccessPage: React.FC = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setErrorMessage('ID da sessão de pagamento não encontrado. O seu pedido não pôde ser confirmado.');
      return;
    }

    const verifySession = async () => {
      try {
        // Crie este novo endpoint no seu backend
        const response = await fetch('https://back-musicfy-origin-3.onrender.com/api/checkout/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao verificar o pagamento.');
        }

        // Se a verificação for bem-sucedida
        setStatus('success');
        clearCart(); // Limpa o carrinho localmente
        localStorage.removeItem('cartId'); // Remove o ID do carrinho do localStorage

      } catch (err) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        setErrorMessage(`Não foi possível confirmar o seu pedido. ${message}`);
        console.error("Erro ao verificar a sessão:", err);
      }
    };

    verifySession();
  }, [searchParams, clearCart]);

  // Renderização condicional com base no status da verificação
  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <FaSpinner className="text-blue-500 text-6xl mx-auto mb-6 animate-spin" />
            <h1 className="text-3xl font-bold text-blue-400 mb-4">A verificar o seu pagamento...</h1>
            <p className="text-gray-400">Por favor, aguarde enquanto confirmamos o seu pedido.</p>
          </>
        );
      case 'success':
        return (
          <>
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
                Ver Os Meus Pedidos
              </Link>
              <Link
                to="/"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Continuar a Comprar
              </Link>
            </div>
          </>
        );
      case 'error':
        return (
          <>
            <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-red-500 mb-4">Ocorreu um erro!</h1>
            <p className="text-gray-400 mb-8">{errorMessage}</p>
            <Link
              to="/cart"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Voltar ao Carrinho
            </Link>
          </>
        );
    }
  };

  return (
    <div className="bg-[#1A002F] text-white min-h-screen flex items-center justify-center p-4">
      <div className="text-center bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default SuccessPage;