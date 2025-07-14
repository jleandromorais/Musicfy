// src/contexts/CartContext.tsx
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  criarCarrinhoComItem,
  adicionarItemAoCarrinho,
  DeletarItem,
  incrementarQuantidade,
  decrementarQuantidade,
  LimparCarrinho,
  obterCarrinhoPorUsuario, // NOVO
  mergeCarts // NOVO
} from '../services/cartApi'; // Certifique-se de que esses imports estão corretos
// src/contexts/CartContext.tsx
import type {  ICartItem } from '../types/cart'; // AQUI: Adicione 'type'
// ... restante do código // Importe os novos tipos

// Ajuste o tipo Product para corresponder ao que você recebe do componente de produto
type ProductInfo = {
  id: number;
  name: string;
  price: number;
  img: string;
};

// Use ICartItem para o estado cartItems
export type CartContextType = {
  cartItems: ICartItem[];
  // Ajustar addToCart para aceitar apenas ProductInfo e ter lógica de backend
  addToCart: (productInfo: ProductInfo, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  isInCart: (productId: number) => boolean;
  changeCartItemQuantity: (productInfo: ProductInfo, newQuantity: number) => void;
  cartId: number | null;
  setCartId: (id: number | null) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be within CartProvider');
  return context;
};

const STORAGE_KEY = 'cartItems';
const CART_ID_STORAGE_KEY = 'cartId';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth(); // Adicione authLoading
  const [cartItems, setCartItems] = useState<ICartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [cartId, setCartId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(CART_ID_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  // Salva o carrinho localmente sempre que ele muda
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Salva o ID do carrinho no localStorage
  useEffect(() => {
    if (cartId !== null) {
      localStorage.setItem(CART_ID_STORAGE_KEY, cartId.toString());
    } else {
      localStorage.removeItem(CART_ID_STORAGE_KEY);
    }
  }, [cartId]);

  // 🚨 Lógica de mesclagem ao fazer login ou carregar a autenticação
  useEffect(() => {
    if (authLoading) return; // Espera a autenticação carregar

    const synchronizeCart = async () => {
      const storedTempCartItems = localStorage.getItem(STORAGE_KEY);
      const tempCartItems: ICartItem[] = storedTempCartItems ? JSON.parse(storedTempCartItems) : [];

      if (currentUser?.id) {
        // Usuário logado
        console.log("Usuário logado. Sincronizando carrinho...");
        try {
          const backendCart = await obterCarrinhoPorUsuario(currentUser.id);

          if (backendCart) {
            // Carrinho existe no backend para este usuário
            if (tempCartItems.length > 0) {
              // Existem itens temporários, mesclar com o carrinho do backend
              console.log("Mesclando carrinho temporário com carrinho do backend...");
              const mergedCart = await mergeCarts(backendCart.id, tempCartItems);
              setCartItems(mergedCart.items);
              setCartId(mergedCart.id);
              localStorage.removeItem(STORAGE_KEY); // Limpa o carrinho temporário local
            } else {
              // Não há itens temporários, apenas carrega o carrinho do backend
              console.log("Carregando carrinho existente do backend...");
              setCartItems(backendCart.items);
              setCartId(backendCart.id);
            }
          } else {
            // Carrinho NÃO existe no backend para este usuário
            if (tempCartItems.length > 0) {
              // Criar um novo carrinho no backend com os itens temporários
              console.log("Criando novo carrinho no backend com itens temporários...");
              const newBackendCart = await criarCarrinhoComItem({
                productId: tempCartItems[0].productId, // A API de criarCarrinhoComItem espera um item inicial
                quantity: tempCartItems[0].quantity,
                userId: currentUser.id
              });
              // Se houver mais itens, adicione-os um por um (ou ajuste a API de criação)
              for (let i = 1; i < tempCartItems.length; i++) {
                await adicionarItemAoCarrinho(newBackendCart.id.toString(), {
                  productId: tempCartItems[i].productId,
                  quantity: tempCartItems[i].quantity
                });
              }
              setCartItems(tempCartItems); // Mantém os itens locais que foram enviados
              setCartId(newBackendCart.id);
              localStorage.removeItem(STORAGE_KEY); // Limpa o carrinho temporário local
            } else {
              // Não há itens temporários e nem carrinho de backend, limpa tudo
              console.log("Nenhum carrinho para sincronizar, limpando local...");
              setCartItems([]);
              setCartId(null);
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(CART_ID_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error("Erro durante a sincronização do carrinho:", error);
          // Em caso de erro na sincronização, pode-se decidir exibir uma mensagem
          // e/ou limpar o carrinho local para evitar dados inconsistentes.
          setCartItems([]);
          setCartId(null);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(CART_ID_STORAGE_KEY);
        }
      } else {
        // Usuário deslogado
        console.log("Usuário deslogado. Mantendo carrinho temporário ou vazio...");
        // Garante que o cartId do backend não está no localStorage para usuários deslogados
        setCartId(null);
        localStorage.removeItem(CART_ID_STORAGE_KEY);
        // O `cartItems` local já reflete o localStorage para convidados
      }
    };

    synchronizeCart();
  }, [currentUser?.id, authLoading]); // Dependências do useEffect

  // Demais funções do contexto (adaptadas para interagir com o backend)

  const addToCart = useCallback(async (productInfo: ProductInfo, quantity: number = 1) => {
    const itemToAdd: ICartItem = {
      productId: productInfo.id,
      name: productInfo.name,
      price: productInfo.price,
      img: productInfo.img,
      quantity: quantity,
    };

    try {
      if (currentUser?.id && cartId) {
        // Usuário logado e já tem um cartId no backend
        await adicionarItemAoCarrinho(cartId.toString(), { productId: productInfo.id, quantity });
        // Atualiza o estado local após o sucesso da API
        setCartItems(prev => {
          const found = prev.find(i => i.productId === productInfo.id);
          if (found) {
            return prev.map(i =>
              i.productId === productInfo.id ? { ...i, quantity: i.quantity + quantity } : i
            );
          }
          return [...prev, { ...itemToAdd }];
        });
      } else if (currentUser?.id && !cartId) {
        // Usuário logado, mas ainda não tem cartId (carrinho novo para este usuário)
        const response = await criarCarrinhoComItem({ productId: productInfo.id, quantity, userId: currentUser.id });
        setCartId(response.id); // Assume que a resposta de criarCarrinhoComItem inclui o ID do carrinho
        setCartItems([itemToAdd]); // Inicia o carrinho localmente com o item adicionado
      } else {
        // Usuário não logado (convidado), apenas atualiza o estado local e localStorage
        setCartItems(prev => {
          const found = prev.find(i => i.productId === productInfo.id);
          if (found) {
            return prev.map(i =>
              i.productId === productInfo.id ? { ...i, quantity: i.quantity + quantity } : i
            );
          }
          return [...prev, { ...itemToAdd }];
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      // Aqui você pode adicionar um toast de erro ou outra notificação
      throw error; // Propaga o erro
    }
  }, [currentUser, cartId]);


  const removeFromCart = useCallback(async (productId: number) => {
    try {
      if (cartId) {
        await DeletarItem(cartId.toString(), productId);
        setCartItems(prev => prev.filter(i => i.productId !== productId));
      } else {
        setCartItems(prev => prev.filter(i => i.productId !== productId));
      }
    } catch (error) {
      console.error("Erro ao remover do carrinho:", error);
      throw error;
    }
  }, [cartId]);

  const updateQuantity = useCallback(async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      if (cartId) {
        // Lógica para chamar API de update ou usar increment/decrement
        // Dado que você tem incrementar/decrementar, pode ser mais fácil chamá-los
        const currentItem = cartItems.find(item => item.productId === productId);
        if (currentItem) {
          if (newQuantity > currentItem.quantity) {
            await incrementarQuantidade(cartId.toString(), productId);
          } else if (newQuantity < currentItem.quantity) {
            await decrementarQuantidade(cartId.toString(), productId);
          }
          setCartItems(prev =>
            prev.map(i =>
              i.productId === productId ? { ...i, quantity: newQuantity } : i
            )
          );
        }
      } else {
        setCartItems(prev =>
          prev.map(i =>
            i.productId === productId ? { ...i, quantity: newQuantity } : i
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      throw error;
    }
  }, [cartId, cartItems, removeFromCart]); // Adicionado cartItems e removeFromCart

  const changeCartItemQuantity = useCallback(async (productInfo: ProductInfo, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productInfo.id);
      return;
    }

    const itemToChange: ICartItem = {
      productId: productInfo.id,
      name: productInfo.name,
      price: productInfo.price,
      img: productInfo.img,
      quantity: newQuantity,
    };

    try {
      if (cartId) {
        // Similar ao updateQuantity, você pode precisar de uma API específica ou usar increment/decrement repetidamente
        // Ou o backend pode ter um endpoint para 'setar' quantidade diretamente
        // Por simplicidade aqui, estou apenas atualizando localmente após a 'chamada' de API imaginada
        // Você precisaria de um endpoint no backend para updateQuantity diretamente ou fazer N chamadas
        const currentItem = cartItems.find(item => item.productId === productInfo.id);
        if (currentItem) {
          if (newQuantity > currentItem.quantity) {
            // Apenas para simular, na prática você chamaria uma API de incremento N vezes ou uma API de set
            await incrementarQuantidade(cartId.toString(), productInfo.id); // Chamada única, não cobre N incrementos
          } else if (newQuantity < currentItem.quantity) {
            // Apenas para simular
            await decrementarQuantidade(cartId.toString(), productInfo.id); // Chamada única, não cobre N decrementos
          }
        } else {
          // Se o item não está no carrinho mas newQuantity > 0, significa que está sendo adicionado
          await adicionarItemAoCarrinho(cartId.toString(), { productId: productInfo.id, quantity: newQuantity });
        }
        
        // Atualiza o estado local, assumindo que a API foi bem-sucedida
        setCartItems(prev => {
          const found = prev.find(i => i.productId === productInfo.id);
          if (found) {
            return prev
              .map(i =>
                i.productId === productInfo.id ? { ...i, quantity: newQuantity } : i
              )
              .filter(i => i.quantity > 0);
          }
          return [...prev, { ...itemToChange }];
        });

      } else {
        // Usuário deslogado, apenas local
        setCartItems(prev => {
          const found = prev.find(i => i.productId === productInfo.id);
          if (found) {
            return prev
              .map(i =>
                i.productId === productInfo.id ? { ...i, quantity: newQuantity } : i
              )
              .filter(i => i.quantity > 0);
          }
          return [...prev, { ...itemToChange }];
        });
      }
    } catch (error) {
      console.error("Erro ao alterar quantidade do item do carrinho:", error);
      throw error;
    }
  }, [cartId, cartItems, removeFromCart]); // Adicionado cartItems e removeFromCart


  const clearCart = useCallback(async () => {
    try {
      if (cartId) {
        await LimparCarrinho(cartId);
      }
      setCartItems([]);
      setCartId(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CART_ID_STORAGE_KEY);
    } catch (error) {
      console.error("Erro ao limpar o carrinho:", error);
      throw error;
    }
  }, [cartId]);

  const isInCart = useCallback(
    (productId: number) => cartItems.some(i => i.productId === productId),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      totalPrice,
      isInCart,
      changeCartItemQuantity,
      cartId,
      setCartId,
    }}>
      {children}
    </CartContext.Provider>
  );
};