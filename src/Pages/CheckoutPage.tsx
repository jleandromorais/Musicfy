import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { ToastContainer, toast } from 'react-toastify';

const paymentOptions = [
  { id: 'credit_card', name: 'Credit Card' },
  { id: 'bank_slip', name: 'Bank Slip' },
  { id: 'pix', name: 'Pix' },
];

const CheckoutPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { cartItems, cartCount, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(paymentOptions[0].id);
  const [discountCoupon, setDiscountCoupon] = useState<string>('');
  const [customerObservations, setCustomerObservations] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast.info("Por favor, faça login para prosseguir com a compra.");
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A002F] text-white">
        Carregando autenticação...
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A002F] text-white p-4">
        <div className="text-center bg-gray-800 rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-orange-500 mb-4">Seu Carrinho está Vazio!</h1>
          <p className="text-gray-400 mb-6">Adicione alguns produtos antes de prosseguir para o checkout.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Ir para Produtos
          </button>
        </div>
      </div>
    );
  }

  const handleFinalizeOrder = () => {
    if (!selectedPaymentMethod) {
      toast.error("Por favor, selecione uma forma de pagamento.");
      return;
    }

    const orderData = {
      userId: currentUser?.uid,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: totalPrice,
      paymentMethod: selectedPaymentMethod,
      discountCoupon: discountCoupon || 'N/A',
      customerObservations: customerObservations || 'N/A',
      orderDate: new Date().toISOString(),
    };

    console.log("Dados do Pedido:", orderData);
    toast.success("Pedido realizado com sucesso!");
    clearCart();
    navigate('/confirmation', { state: { orderData } });
  };

  const currentPaymentOption = paymentOptions.find(opt => opt.id === selectedPaymentMethod);

  return (
    <div className="bg-[#1A002F] text-white min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <ToastContainer position="bottom-right" />
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#35589A] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Seção de Resumo do Carrinho */}
          <div className="lg:w-2/3 bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Seus Itens ({cartCount})</h2>
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between border-b border-gray-700 py-3 last:border-b-0">
                <div className="flex items-center gap-4">
                  <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-gray-400 text-sm">Quantidade: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-orange-400 font-semibold">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="mt-6 flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-orange-500">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Seção do Formulário de Pagamento */}
          <div className="lg:w-1/3 bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Pagamento</h2>

            {/* Forma de Pagamento */}
            <div>
              <label htmlFor="paymentMethod" className="block text-gray-300 text-sm font-bold mb-2">
                Forma de Pagamento:
              </label>
              <select
                id="paymentMethod"
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                required
              >
                {paymentOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cupom de Desconto */}
            <div>
              <label htmlFor="discountCoupon" className="block text-gray-300 text-sm font-bold mb-2">
                Cupom de Desconto:
              </label>
              <input
                type="text"
                id="discountCoupon"
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Insira o código do cupom (opcional)"
                value={discountCoupon}
                onChange={(e) => setDiscountCoupon(e.target.value)}
              />
            </div>

            {/* Observações do Cliente */}
            <div>
              <label htmlFor="customerObservations" className="block text-gray-300 text-sm font-bold mb-2">
                Observações:
              </label>
              <textarea
                id="customerObservations"
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
                placeholder="Alguma instrução especial?"
                value={customerObservations}
                onChange={(e) => setCustomerObservations(e.target.value)}
              ></textarea>
            </div>

            <button
              onClick={handleFinalizeOrder}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors mt-6"
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;