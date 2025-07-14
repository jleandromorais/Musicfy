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

type Product = {
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
  const { currentUser } = useAuth();
  const [prevUserId, setPrevUserId] = useState<number | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
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

  // 🚨 Limpa o carrinho se trocar de conta (incluindo logout)
  useEffect(() => {
    const newUserId = currentUser?.id ?? null;
    if (prevUserId !== null && prevUserId !== newUserId) {
      setCartItems([]);
      setCartId(null);
    }
    setPrevUserId(newUserId);
  }, [currentUser?.id, prevUserId]);

  // Demais funções do contexto
  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const found = prev.find(i => i.productId === product.id);
      if (found)
        return prev.map(i =>
          i.productId === product.id ? {...i, quantity: i.quantity + 1} : i
        );
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity: 1,
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(i =>
        i.productId === productId ? {...i, quantity: newQuantity} : i
      )
    );
  }, [removeFromCart]);

  const changeCartItemQuantity = useCallback((product: Product, newQuantity: number) => {
    setCartItems(prev => {
      const found = prev.find(i => i.productId === product.id);
      if (found) {
        return prev
          .map(i =>
            i.productId === product.id ? {...i, quantity: newQuantity} : i
          )
          .filter(i => i.quantity > 0);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        quantity: newQuantity,
      }];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartId(null);
  }, []);

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
//lsssl