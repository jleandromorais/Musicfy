// src/types/cart.ts

export type ICartItem = {
  productId: number;
  name: string;
  price: number;
  img: string; // URL da imagem
  quantity: number;
};

export type ICart = {
  id: number;
  userId: number; // Ou firebaseUid, dependendo de como você associa
  items: ICartItem[];
  totalPrice: number;
  // Outros campos do seu objeto Cart do backend, se houver
};