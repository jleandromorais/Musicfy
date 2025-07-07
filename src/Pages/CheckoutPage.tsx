// src/Pages/CheckoutPage.tsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ToastContainer, toast } from 'react-toastify';

const opcoesEntrega = [
  { id: 'padrao', name: 'Envio Padrão', price: 15.00, estimatedTime: '5-7 dias úteis' },
  { id: 'expresso', name: 'Envio Expresso', price: 30.00, estimatedTime: '1-3 dias úteis' },
  { id: 'retirada', name: 'Retirada Local', price: 0.00, estimatedTime: 'Pronto em 24 horas' },
];

const CheckoutPage: React.FC = () => {
  const { cartId, cartItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const { detalhesEntrega } = location.state || {};

  const selectedDeliveryOption = opcoesEntrega.find(
    opt => opt.id === (detalhesEntrega?.metodoEntrega || 'padrao')
  );

  const shippingCost = selectedDeliveryOption?.price ?? 0;
  const grandTotal = totalPrice + shippingCost;

  // Removei a verificação de autenticação e redirecionamentos

  const handleFinalizeOrder = async () => {
    // Aqui só um aviso simples caso dados estejam faltando
    if (!cartId || !detalhesEntrega?.enderecoId || cartItems.length === 0) {
      toast.error('Dados insuficientes para finalizar o pedido. Verifique seu carrinho e endereço.');
      return;
    }

    const payload = {
      cartId: cartId,
      userId: detalhesEntrega?.userId ?? null, // Você pode ajustar isso conforme seu fluxo
      enderecoId: detalhesEntrega.enderecoId,
      items: cartItems.map((item) => ({
        nomeProduto: item.name,
        precoUnitario: item.price,
        quantidade: item.quantity,
      })),
    };

    try {
      const response = await fetch('http://localhost:8080/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na criação da sessão de pagamento: ${errorText}`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('URL de pagamento não recebida.');
      }
    } catch (error) {
      console.error('Erro ao finalizar o pedido:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao iniciar o pagamento.';
      toast.error(`Falha ao iniciar o pagamento: ${errorMessage}. Tente novamente.`);
    }
  };

  return (
    <div className="bg-[#1A002F] text-white min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <ToastContainer position="bottom-right" />
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#35589A] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Seção de Resumo do Pedido */}
          <div className="lg:w-2/3 bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Resumo do Pedido</h2>
            
            {/* Itens */}
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center border-b border-gray-700 py-3">
                <div className="flex items-center gap-4">
                  <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-gray-400 text-sm">Quantidade: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            
            {/* Cálculos de Custo */}
            <div className="mt-6 space-y-2 border-t border-gray-700 pt-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal dos produtos:</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Frete ({selectedDeliveryOption?.name}):</span>
                <span>R$ {shippingCost.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-400 text-right">
                Tempo de entrega estimado: {selectedDeliveryOption?.estimatedTime}
              </p>
            </div>

            {/* Total Final */}
            <div className="mt-4 flex justify-between items-center text-xl font-bold border-t border-orange-500 pt-4">
              <span>Total a pagar:</span>
              <span className="text-orange-500">R$ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Seção de Pagamento */}
          <div className="lg:w-1/3 bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center">Forma de Pagamento</h2>
            <p className="text-gray-400 text-center mb-6">
              Ao clicar no botão, você será redirecionado para um ambiente 100% seguro para concluir o pagamento.
            </p>
            <button
              onClick={handleFinalizeOrder}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Pagar com Stripe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
