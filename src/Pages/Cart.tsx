import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import {
  fetchCart,
  addCartItem,
  removeCartItem,
  incrementQuantity,
  decrementQuantity
} from '../services/api'; // Ajuste o caminho conforme necessário

// Tipagens (mantenha as mesmas)
export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  totalPrice: number;
  isInCart: (productId: number) => boolean;
  changeCartItemQuantity: (product: Product, newQuantity: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartId] = useState<number>(1); // ID fixo para exemplo (em produção, gere dinamicamente)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega o carrinho ao iniciar
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        const cartData = await fetchCart(cartId);
        setCartItems(cartData.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error("Erro ao carregar carrinho:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCart();
  }, [cartId]);

  const addToCart = useCallback(async (product: Product) => {
    try {
      setIsLoading(true);
      await addCartItem(cartId, product.id, 1);
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        return existingItem
          ? prevItems.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevItems, { ...product, quantity: 1 }];
      });
      
      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error(`Falha ao adicionar ${product.name}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  const removeFromCart = useCallback(async (productId: number) => {
    try {
      setIsLoading(true);
      await removeCartItem(cartId, productId);
      
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      toast.success('Item removido do carrinho!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Falha ao remover item');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  const changeCartItemQuantity = useCallback(async (product: Product, newQuantity: number) => {
    try {
      setIsLoading(true);
      
      if (newQuantity <= 0) {
        await removeFromCart(product.id);
        return;
      }

      // Determina se precisa incrementar ou decrementar
      const currentItem = cartItems.find(item => item.id === product.id);
      if (!currentItem) {
        await addCartItem(cartId, product.id, newQuantity);
      } else if (newQuantity > currentItem.quantity) {
        await incrementQuantity(cartId, product.id);
      } else {
        await decrementQuantity(cartId, product.id);
      }

      setCartItems(prevItems =>
        prevItems
          .map(item =>
            item.id === product.id ? { ...item, quantity: newQuantity } : item
          )
          .filter(item => item.quantity > 0)
      );
      
      toast.success('Quantidade atualizada!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Falha ao atualizar quantidade');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [cartId, cartItems, removeFromCart]);

  // Outras funções (clearCart, etc) seguindo o mesmo padrão

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity: changeCartItemQuantity,
    clearCart: async () => {
      try {
        setIsLoading(true);
        // Implemente a limpeza no backend se necessário
        setCartItems([]);
        toast.success('Carrinho limpo!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        toast.error('Falha ao limpar carrinho');
      } finally {
        setIsLoading(false);
      }
    },
    cartCount: useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]),
    totalPrice: useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]),
    isInCart: useCallback((productId: number) => 
      cartItems.some(item => item.id === productId), [cartItems]),
    changeCartItemQuantity,
    isLoading,
    error
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};