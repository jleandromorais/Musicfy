// api.ts
const API_BASE_URL = "http://localhost:8080/api/carrinho";

export const fetchCart = async (cartId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}`);
  if (!response.ok) throw new Error('Erro ao carregar carrinho');
  return await response.json();
};

export const addCartItem = async (cartId: number, productId: number, quantity: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/adicionar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  if (!response.ok) throw new Error('Erro ao adicionar item');
  return await response.json();
};

export const removeCartItem = async (cartId: number, productId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/remover/${productId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Erro ao remover item');
  return await response.json();
};

export const incrementQuantity = async (cartId: number, productId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/incrementar/${productId}`, {
    method: 'PATCH'
  });
  if (!response.ok) throw new Error('Erro ao incrementar quantidade');
  return await response.json();
};

export const decrementQuantity = async (cartId: number, productId: number) => {
  const response = await fetch(`${API_BASE_URL}/${cartId}/decrementar/${productId}`, {
    method: 'PATCH'
  });
  if (!response.ok) throw new Error('Erro ao decrementar quantidade');
  return await response.json();
};