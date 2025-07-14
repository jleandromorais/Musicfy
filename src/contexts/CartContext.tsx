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
} from '../services/cartApi';
import type { ICartItem} from '../types/cart'; // Certifique-se que ICart está aqui também

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
  const { currentUser, loading: authLoading } = useAuth();
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

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
        // CORREÇÃO 1: Garante que userId é um número limpo para a chamada API
        const userIdNumber = Number(currentUser.id);
        if (isNaN(userIdNumber)) {
            console.error("Erro: currentUser.id não é um número válido.", currentUser.id);
            // Decide como lidar: talvez limpar carrinho e redirecionar para login
            setCartItems([]);
            setCartId(null);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(CART_ID_STORAGE_KEY);
            return;
        }

        console.log("Usuário logado. Sincronizando carrinho para userId:", userIdNumber);
        try {
          const backendCart = await obterCarrinhoPorUsuario(userIdNumber); // Use o userIdNumber corrigido

          if (backendCart) {
            // Carrinho existe no backend para este usuário
            if (tempCartItems.length > 0) {
              console.log("Mesclando carrinho temporário com carrinho do backend...");
              const mergedCart = await mergeCarts(backendCart.id, tempCartItems);
              setCartItems(mergedCart.items);
              setCartId(mergedCart.id);
              localStorage.removeItem(STORAGE_KEY);
            } else {
              console.log("Carregando carrinho existente do backend...");
              setCartItems(backendCart.items);
              setCartId(backendCart.id);
            }
          } else {
            // Carrinho NÃO existe no backend para este usuário
            if (tempCartItems.length > 0) {
              console.log("Criando novo carrinho no backend com itens temporários...");
              // CORREÇÃO 2: A API de criarCarrinhoComItem precisa do userId para criar o carrinho correto
              const newBackendCartResponse = await criarCarrinhoComItem({
                productId: tempCartItems[0].productId,
                quantity: tempCartItems[0].quantity,
                userId: userIdNumber // Passe o userId aqui
              });

              // CORREÇÃO 3: Acesse 'cartId' da resposta, não 'id'
              const newCartId = (newBackendCartResponse as any).cartId; // Use 'as any' temporariamente se o tipo de retorno não for preciso
              if (newCartId === undefined || newCartId === null) {
                  throw new Error("ID do carrinho não recebido ao criar novo carrinho.");
              }

              // Adicione os itens restantes, se houver
              for (let i = 1; i < tempCartItems.length; i++) {
                await adicionarItemAoCarrinho(newCartId.toString(), {
                  productId: tempCartItems[i].productId,
                  quantity: tempCartItems[i].quantity
                });
              }
              setCartItems(tempCartItems);
              setCartId(newCartId); // Use o newCartId corrigido
              localStorage.removeItem(STORAGE_KEY);
            } else {
              console.log("Nenhum carrinho para sincronizar, limpando local...");
              setCartItems([]);
              setCartId(null);
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(CART_ID_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error("Erro durante a sincronização do carrinho:", error);
          setCartItems([]);
          setCartId(null);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(CART_ID_STORAGE_KEY);
        }
      } else {
        // Usuário deslogado
        console.log("Usuário deslogado. Mantendo carrinho temporário ou vazio...");
        setCartId(null);
        localStorage.removeItem(CART_ID_STORAGE_KEY);
      }
    };

    synchronizeCart();
  }, [currentUser?.id, authLoading]);

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
      if (currentUser?.id) { // Agora currentUser.id é garantido ser numérico pela sincronização
        const userIdNumber = Number(currentUser.id); // Re-converte para garantir
        if (isNaN(userIdNumber)) { // Verificação redundante mas segura
            console.error("Erro: currentUser.id não é um número válido ao adicionar ao carrinho.");
            return;
        }

        if (cartId) {
          // Usuário logado e já tem um cartId no backend
          await adicionarItemAoCarrinho(cartId.toString(), { productId: productInfo.id, quantity });
          setCartItems(prev => {
            const found = prev.find(i => i.productId === productInfo.id);
            if (found) {
              return prev.map(i =>
                i.productId === productInfo.id ? { ...i, quantity: i.quantity + quantity } : i
              );
            }
            return [...prev, { ...itemToAdd }];
          });
        } else {
          // Usuário logado, mas ainda não tem cartId (carrinho novo para este usuário)
          const newBackendCartResponse = await criarCarrinhoComItem({ productId: productInfo.id, quantity, userId: userIdNumber });
          const newCartId = (newBackendCartResponse as any).cartId; // Use 'cartId'
          if (newCartId === undefined || newCartId === null) {
              throw new Error("ID do carrinho não recebido ao criar novo carrinho durante addToCart.");
          }
          setCartId(newCartId);
          setCartItems([itemToAdd]);
        }
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
      throw error;
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
  }, [cartId, cartItems, removeFromCart]);

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
        const currentItem = cartItems.find(item => item.productId === productInfo.id);
        if (currentItem) {
          if (newQuantity > currentItem.quantity) {
            await incrementarQuantidade(cartId.toString(), productInfo.id);
          } else if (newQuantity < currentItem.quantity) {
            await decrementarQuantidade(cartId.toString(), productInfo.id);
          }
        } else {
          await adicionarItemAoCarrinho(cartId.toString(), { productId: productInfo.id, quantity: newQuantity });
        }
        
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
  }, [cartId, cartItems, removeFromCart]);


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