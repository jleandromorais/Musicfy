// src/contexts/CartContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '../hooks/useAuth'; // IMPORTANTE

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
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const STORAGE_KEY = 'cartItems';
const CART_ID_STORAGE_KEY = 'cartId';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth(); // 🔥 Pega o usuário autenticado

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [cartId, setCartId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const savedCartId = localStorage.getItem(CART_ID_STORAGE_KEY);
      return savedCartId ? parseInt(savedCartId, 10) : null;
    }
    return null;
  });

  // Salvar itens e ID no localStorage
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

  // 🔥 NOVO: Buscar carrinho do backend pelo userId
  useEffect(() => {
    const fetchCartFromBackend = async () => {
      if (!currentUser?.id) return;

      try {
        const res = await fetch(`http://localhost:8080/api/carrinho/usuario/${currentUser.id}`);
        if (!res.ok) throw new Error(`Erro ao buscar carrinho: ${res.status}`);
        const backendCart = await res.json();

        setCartId(backendCart.id);
        console.log("🛒 Carrinho carregado do backend:", backendCart);

        // Se quiser, você pode também atualizar os itens do carrinho com base no backend:
        // setCartItems(backendCart.itens);
      } catch (err) {
        console.error('❌ Erro ao carregar carrinho do backend:', err);
      }
    };

    fetchCartFromBackend();
  }, [currentUser]);

  const addToCart = useCallback((product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartId(null);
  }, []);

  const isInCart = useCallback(
    (productId: number) => cartItems.some(item => item.productId === productId),
    [cartItems]
  );

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
      return [
        ...prevItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          quantity: newQuantity,
        },
      ];
    });
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const value: CartContextType = {
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
