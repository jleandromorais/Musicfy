// src/Pages/Cart.tsx
import { useCart, type CartItem } from '../contexts/CartContext';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useEffect } from 'react';
import {
  DeletarItem,
  incrementarQuantidade,
  decrementarQuantidade,
  LimparCarrinho
} from '../services/cartApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    clearCart,
    cartCount,
    totalPrice,
    changeCartItemQuantity,
    cartId
  } = useCart();

  // Se não houver carrinho (ex: limpo ao trocar de conta), exibe mensagem
  if (!cartId || cartItems.length === 0) {
    return (
      <div className="bg-[#1A002F] text-white min-h-screen p-4 flex items-center justify-center">
        <div className="text-center bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
          <FaShoppingBag className="text-6xl text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            Seu carrinho está vazio.
          </h1>
          <p className="text-gray-400 mb-6">
            Comece a adicionar produtos para uma compra!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Ir para a página inicial
          </button>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  const handleQuantityChange = async (item: CartItem, newQ: number) => {
    if (newQ < 1) return;
    try {
      if (newQ > item.quantity) {
        await incrementarQuantidade(cartId.toString(), item.productId);
      } else {
        await decrementarQuantidade(cartId.toString(), item.productId);
      }
      changeCartItemQuantity({
        id: item.productId,
        name: item.name,
        price: item.price,
        img: item.img
      }, newQ);
      toast.success(`Quantidade atualizada para ${newQ}`);
    } catch (err) {
      toast.error("Erro ao atualizar quantidade");
      console.error(err);
    }
  };

  return (
    <div className="bg-[#1A002F] text-white min-h-screen p-4 relative">
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-500 mb-6 flex items-center gap-4">
          <FaShoppingBag /> Seu Carrinho ({cartCount})
        </h1>
        {cartItems.map(item => (
          <div key={item.productId} className="flex items-center justify-between border-b border-gray-700 pb-4">
            <div className="flex items-center gap-4">
              <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              <div>
                <h2 className="text-lg font-bold">{item.name}</h2>
                <p className="text-orange-400 font-semibold">R$ {item.price.toFixed(2)}</p>
                <div className="flex items-center mt-1 gap-2">
                  <button onClick={() => handleQuantityChange(item, item.quantity - 1)} disabled={item.quantity <= 1} className="text-gray-300 hover:text-orange-500 p-1">-</button>
                  <span className="text-sm text-gray-400 w-6 text-center">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="text-gray-300 hover:text-orange-500 p-1">+</button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-orange-400 font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={async () => {
                  try {
                    await DeletarItem(cartId.toString(), item.productId);
                    removeFromCart(item.productId);
                    toast.success("Item removido do carrinho");
                  } catch (err: any) {
                    toast.error(err.message || "Erro ao remover item");
                    console.error(err);
                  }
                }}
                className="text-red-500 hover:text-red-400"
                aria-label="Remover item"
              >
                <FaTrash size={18} />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-2xl font-bold">
            Total: <span className="text-orange-500">R$ {totalPrice.toFixed(2)}</span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={async () => {
                try {
                  await LimparCarrinho(cartId);
                  clearCart();
                  toast.success("Carrinho limpo com sucesso");
                } catch (err: any) {
                  toast.error(err.message || "Erro ao limpar carrinho");
                  console.error(err);
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Limpar Carrinho
            </button>
            <button
              onClick={() => navigate('/delivery')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Cart;
