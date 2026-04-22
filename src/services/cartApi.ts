import type { ICart, ICartItem } from '../types/cart';
import { handleApiResponse, handleError } from './errorHandler';

const BASE_URL = "https://back-musicfy-origin-3.onrender.com/api/carrinho";

export const criarCarrinhoComItem = async ({
  productId,
  quantity,
  userId,
}: {
  productId: number;
  quantity: number;
  userId?: number;
}) => {
  const payload: { productId: number; quantity: number; userId?: number } = { productId, quantity };
  if (userId) payload.userId = userId;

  const response = await fetch(`${BASE_URL}/criar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleApiResponse(response, 'item');
};

export const adicionarItemAoCarrinho = async (
  cartId: string,
  { productId, quantity }: { productId: number; quantity: number },
) => {
  const response = await fetch(`${BASE_URL}/${cartId}/adicionar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });

  return handleApiResponse(response, 'item');
};

export const DeletarItem = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/remover/${productId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  return handleApiResponse(response, 'item');
};

export const incrementarQuantidade = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/incrementar/${productId}`, {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });

  return handleApiResponse(response, 'item');
};

export const decrementarQuantidade = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/decrementar/${productId}`, {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });

  return handleApiResponse(response, 'item');
};

export const LimparCarrinho = async (cartId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/limpar`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  return handleApiResponse(response, 'carrinho');
};

export const obterCarrinhoPorUsuario = async (userId: number): Promise<ICart | null> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}`);
    if (response.status === 404) return null;
    return (await handleApiResponse(response, 'carrinho')) as ICart;
  } catch (error) {
    return handleError(error);
  }
};

export const mergeCarts = async (cartId: number, tempItems: ICartItem[]): Promise<ICart> => {
  const response = await fetch(`${BASE_URL}/${cartId}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: tempItems.map(({ productId, quantity }) => ({ productId, quantity })),
    }),
  });

  return (await handleApiResponse(response, 'carrinho')) as ICart;
};
