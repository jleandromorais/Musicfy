import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';

// --- TIPAGENS ---

// O TIPO DE UM PRODUTO, como definido na sua página de produtos
// É útil ter tipos compartilhados, mas por agora vamos definir aqui para clareza.
type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  // Outras propriedades que um produto possa ter...
};

// O TIPO DE UM ITEM DENTRO DO CARRINHO
export type CartItem = {
  productId: number;
  name: string;
  price: number;
  img: string;
  quantity: number;
};

// O TIPO DO CONTEXTO
export type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product) => void; // A função espera receber um objeto do tipo 'Product'
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  isInCart: (productId: number) => boolean;
  changeCartItemQuantity: (product: Product, newQuantity: number) => void; // Também espera um 'Product'
};

// --- CRIAÇÃO E USO DO CONTEXTO ---

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const STORAGE_KEY = 'cartItems';

// --- COMPONENTE PROVIDER (LÓGICA PRINCIPAL) ---

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // --- FUNÇÕES DO CARRINHO (CORRIGIDAS) ---

  const addToCart = useCallback((product: Product) => { // A função espera um 'Product'
    setCartItems(prevItems => {
      // ✅ CORREÇÃO: Usa `product.id` para procurar o item existente
      const existingItem = prevItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          // ✅ CORREÇÃO: Usa `product.id` para encontrar o item a ser atualizado
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // ✅ CORREÇÃO: Mapeia corretamente `product.id` para `productId`
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
        // ✅ CORREÇÃO: Usa `product.id` para todas as operações
        const existingItem = prevItems.find(item => item.productId === product.id);
        if (existingItem) {
          return prevItems
            .map(item =>
              item.productId === product.id
                ? { ...item, quantity: newQuantity }
                : item
            )
            .filter(item => item.quantity > 0); // Remove se a quantidade for 0
        }
        // Se não existir (cenário menos comum para esta função), adiciona
        return [...prevItems, {
            productId: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: newQuantity
        }];
    });
  }, []);

  // --- VALORES MEMORIZADOS ---
  
  const cartCount = useMemo(() =>
    cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(() =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  // --- VALOR DO CONTEXTO ---

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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};