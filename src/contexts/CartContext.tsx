import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';

// --- 1. Definição de Tipagens ---
export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  img: string;
  quantity: number;
};

export type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  isInCart: (productId: number) => boolean;
  changeCartItemQuantity: (product: Product, newQuantity: number) => void;
};

// --- 2. Criação do Contexto ---
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- 3. Hook Personalizado ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// --- 4. Chave para LocalStorage ---
const STORAGE_KEY = 'cartItems';

// --- 5. Componente Provider ---
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // --- 6. Persistência ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 7. Funções do Carrinho ---
  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { 
        productId: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity: 1 
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback((productId: number) => {
    return cartItems.some(item => item.productId === productId);
  }, [cartItems]);

  const changeCartItemQuantity = useCallback((product: Product, newQuantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        return prevItems
          .map(item =>
            item.productId === product.id
              ? { ...item, quantity: newQuantity }
              : item
          )
          .filter(item => item.quantity > 0);
      }
      return [...prevItems, {
        productId: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity: newQuantity
      }];
    });
  }, []);

  // --- 8. Cálculos Derivados ---
  const cartCount = useMemo(() =>
    cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(() =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  // --- 9. Valor do Contexto ---
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalPrice,
    isInCart,
    changeCartItemQuantity
  };

  // --- 10. Renderização ---
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};