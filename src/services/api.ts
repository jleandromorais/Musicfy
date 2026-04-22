import { handleApiResponse } from './errorHandler';

const API_BASE_URL = "https://back-musicfy-origin-3.onrender.com/api/carrinho";

export const fetchCart = async (cartId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}`);
  return handleApiResponse(response, 'carrinho');
};

export const addCartItem = async (cartId: number, productId: number, quantity: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/adicionar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  return handleApiResponse(response, 'item');
};

export const removeCartItem = async (cartId: number, productId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/remover/${productId}`, {
    method: 'DELETE',
  });
  return handleApiResponse(response, 'item');
};

export const incrementQuantity = async (cartId: number, productId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/incrementar/${productId}`, {
    method: 'PATCH',
  });
  return handleApiResponse(response, 'item');
};

export const decrementQuantity = async (cartId: number, productId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/decrementar/${productId}`, {
    method: 'PATCH',
  });
  return handleApiResponse(response, 'item');
};

export const clearCart = async (cartId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/limpar`, {
    method: 'DELETE',
  });
  return handleApiResponse(response, 'carrinho');
};
