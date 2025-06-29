import React from 'react';
import { useCart, type CartItem } from '../contexts/CartContext';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import { DeletarItem,incrementarQuantidade,decrementarQuantidade,LimparCarrinho} from '../services/cartApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
 const { cartItems, removeFromCart, clearCart, cartCount, totalPrice, changeCartItemQuantity } = useCart();
const cartId = localStorage.getItem("cartId");

    if (!cartId) {
    toast.error("Carrinho não encontrado");
    return null;
  }

  // Função para lidar com mudança de quantidade
 const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
  if (newQuantity < 1) return; // não permite zero ou negativo

  try {
    if (newQuantity > item.quantity) {
      await incrementarQuantidade(cartId, item.productId);
    } else if (newQuantity < item.quantity) {
      await decrementarQuantidade(cartId, item.productId);
    }

    changeCartItemQuantity({
      id: item.productId,
      name: item.name,
      price: item.price,
      img: item.img,
    }, newQuantity);

    toast.success(`Quantidade atualizada para ${newQuantity}`);
  } catch (error) {
    toast.error("Erro ao atualizar quantidade");
    console.error(error);
  }
};

  return (
    <div className="bg-[#1A002F] text-white min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#35589A] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-6 sm:mb-8 flex items-center gap-4">
          <FaShoppingBag /> Seu Carrinho ({cartCount})
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
            <p className="text-xl text-gray-400">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between border-b border-gray-700 pb-4">
                  <div className="flex items-center gap-4">
                    <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                    <div>
                      <h2 className="text-lg font-bold">{item.name}</h2>
                      <p className="text-orange-400 font-semibold">R$ {item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-1 gap-2">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="text-gray-300 hover:text-orange-500 transition-colors p-1"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm text-gray-400 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="text-gray-300 hover:text-orange-500 transition-colors p-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-orange-400 font-semibold">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Botão Remover */}
                    <button
                      onClick={async () => {
                        const cartId = localStorage.getItem("cartId");

                        if (!cartId) {
                          toast.error("Carrinho não encontrado");
                          return;
                        }

                        try {
                          await DeletarItem(cartId, item.productId);
                          removeFromCart(item.productId);
                          toast.success("Item removido do carrinho");
                        } catch (error: any) {
                          console.error(`Erro ao remover o item de id: ${item.productId}`, error);
                          if (error.message) {
                            toast.error(error.message);
                          } else {
                            toast.error("Erro desconhecido ao remover o item");
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      aria-label="Remover item do carrinho"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-2xl font-bold">
                Total: <span className="text-orange-500">R$ {totalPrice.toFixed(2)}</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <button
  onClick={async () => {
    try {
      if (!cartId) {
        toast.error("Carrinho não encontrado");
        return;
      }
      
      // Clear server cart
      await LimparCarrinho(cartId);
      
      // Clear local cart
      clearCart();
      
      toast.success("Carrinho limpo com sucesso");
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao limpar carrinho");
    }
  }}
  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors w-full sm:w-auto"
>
  Limpar Carrinho
</button>
                <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors w-full sm:w-auto">
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Cart;
