import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { ToastContainer, toast } from 'react-toastify';

const deliveryOptions = [
  { id: 'standard', name: 'Standard Shipping', price: 15.00, estimatedTime: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 30.00, estimatedTime: '1-3 business days' },
  { id: 'pickup', name: 'Local Pickup', price: 0.00, estimatedTime: 'Ready in 24 hours' },
];

const addressTypes = [
  { id: 'home', name: 'Casa' },
  { id: 'work', name: 'Trabalho' },
  { id: 'other', name: 'Outro' },
];

const DeliveryDetailsPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [cep, setCep] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [complement, setComplement] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [addressType, setAddressType] = useState<string>(addressTypes[0].id);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>(deliveryOptions[0].id);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast.info("Por favor, faça login para prosseguir com a compra.");
      navigate('/login');
    }
    if (!authLoading && currentUser && cartCount === 0) {
      toast.info("Seu carrinho está vazio. Adicione produtos para continuar.");
      navigate('/cart');
    }
  }, [currentUser, authLoading, navigate, cartCount]);

  const handleContinueToCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cep.trim() || !street.trim() || !number.trim() || !neighborhood.trim() || !city.trim() || !state.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios do endereço.");
      return;
    }

    const deliveryDetails = {
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      type: addressType,
      deliveryMethod: selectedDeliveryMethod,
    };

    console.log('Navegando para checkout com:', deliveryDetails); // Adicionei para debug
    navigate('/checkout', { state: { deliveryDetails } });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A002F] text-white">Carregando...</div>;
  }

  if (!currentUser || cartCount === 0) {
    return null;
  }

  return (
    <div className="bg-[#1A002F] text-white min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <ToastContainer position="bottom-right" />
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#35589A] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-8 text-center">Detalhes de Entrega</h1>

        <form onSubmit={handleContinueToCheckout} className="space-y-6">
          {/* Campos do formulário permanecem os mesmos */}
          {/* ... */}

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors mt-6"
          >
            Continuar para o Pagamento
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryDetailsPage;