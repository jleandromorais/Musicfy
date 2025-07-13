// src/Pages/Cart.tsx
import { useCart, type CartItem } from '../contexts/CartContext';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import { DeletarItem, incrementarQuantidade, decrementarQuantidade, LimparCarrinho } from '../services/cartApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    // <<< HOOKS NECESSÁRIOS PARA A LÓGICA DE LIMPEZA E REDIRECIONAMENTO >>>
    const navigate = useNavigate();
    const { cartItems, removeFromCart, clearCart, cartCount, totalPrice, changeCartItemQuantity } = useCart();
    const cartId = localStorage.getItem("cartId");

    // <<< NOVA FUNÇÃO ADICIONADA PARA LIDAR COM LOGOUT / TROCA DE CONTA >>>
    // Esta é a função mais importante para resolver seu problema.
    // Ela garante que o carrinho seja totalmente limpo antes de um novo login.
    const handleLogout = () => {
        console.log("⚠️ INICIANDO LOGOUT/TROCA DE CONTA...");

        // Chame aqui qualquer outra lógica que você tenha para deslogar o usuário
        // Ex: authService.logout();

        // 1. A PARTE MAIS IMPORTANTE: Limpa o ID do carrinho do navegador
        console.log("Removendo 'cartId' do localStorage...");
        localStorage.removeItem("cartId");
        console.log("'cartId' removido! Verifique o localStorage no navegador (F12 > Application).");

        // 2. Limpa o estado visual do carrinho na interface para zerá-lo imediatamente
        clearCart();
        console.log("Estado do carrinho na interface foi limpo.");

        // 3. Redireciona o usuário para a tela de login para que possa entrar com outra conta
        toast.info("Você foi desconectado. O carrinho foi limpo.");
        navigate('/login'); // Altere para a sua rota de login
    };


    if (!cartId || cartItems.length === 0) { // <<< Condição ajustada para checar também se há itens >>>
        return (
            <div className="bg-[#1A002F] text-white min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
                    <FaShoppingBag className="text-6xl text-gray-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-4">Seu carrinho está vazio.</h1>
                    <p className="text-gray-400 mb-6">Adicione produtos para vê-los aqui!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Ir para a página inicial
                    </button>
                    {/* <<< BOTÃO DE LOGOUT DE EXEMPLO PARA CASO O USUÁRIO ESTEJA LOGADO MAS SEM CARRINHO >>> */}
                    <button
                        onClick={handleLogout}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Sair / Trocar de Conta
                    </button>
                </div>
                <ToastContainer position="bottom-right" />
            </div>
        );
    }

    const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            if (newQuantity > item.quantity) {
                await incrementarQuantidade(cartId, item.productId);
            } else if (newQuantity < item.quantity) {
                await decrementarQuantidade(cartId, item.productId);
            }

            changeCartItemQuantity(
                {
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    img: item.img,
                },
                newQuantity
            );

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
                                    <button
                                        onClick={async () => {
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
                                                toast.error(error.message || "Erro desconhecido ao remover o item");
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
                                        const cartIdNum = Number(cartId);
                                        if (isNaN(cartIdNum)) {
                                            toast.error("ID do carrinho inválido");
                                            return;
                                        }
                                        await LimparCarrinho(cartIdNum);
                                        clearCart(); // Limpa o estado local também
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

                            <button onClick={() => navigate('/delivery')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors w-full sm:w-auto">
                                Finalizar Compra
                            </button>
                        </div>
                    </div>
                    {/* <<< NOVO BOTÃO ADICIONADO AQUI TAMBÉM >>> */}
                    <div className="mt-6 border-t border-gray-700 pt-4 flex justify-end">
                         <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                         >
                             Sair / Trocar de Conta
                         </button>
                    </div>
                </div>
            </div>

            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default Cart;