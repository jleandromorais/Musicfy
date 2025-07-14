// src/services/cartApi.ts


// src/contexts/CartContext.tsx
import type { ICart, ICartItem } from '../types/cart'; // AQUI: Adicione 'type'
// ... restante do código 


const BASE_URL = "https://back-musicfy-origin-3.onrender.com/api/carrinho";

// Helper function for consistent error handling
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorData = await response.json();
      errorDetails = errorData.message || JSON.stringify(errorData);
    } catch {
      errorDetails = await response.text();
    }
    
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      details: errorDetails,
    });
    
    throw new Error(errorDetails || `HTTP error! status: ${response.status}`);
  }

  try {
    const text = await response.text();
    // Retorna o objeto JSON se houver conteúdo, caso contrário, retorna um objeto vazio
    return text ? JSON.parse(text) : {};
  } catch (parseError) {
    // Se não for possível fazer o parse como JSON, retorna um objeto vazio ou o texto
    console.warn('Could not parse response as JSON, returning raw text or empty object:', parseError);
    return {}; // ou 'return text;' se você preferir o texto bruto em caso de falha no JSON
  }
};

export const criarCarrinhoComItem = async ({ 
  productId, 
  quantity,
  userId // Adicione userId aqui para criar carrinho para usuário logado com itens
}: { 
  productId: number; 
  quantity: number;
  userId?: number; // userId é opcional para convidados, mas necessário para usuários
}) => {
  const payload: { productId: number; quantity: number; userId?: number } = { productId, quantity };
  if (userId) {
    payload.userId = userId;
  }

  const response = await fetch(`${BASE_URL}/criar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleApiResponse(response);
};

export const adicionarItemAoCarrinho = async (
  cartId: string, 
  { productId, quantity }: { productId: number; quantity: number }
) => {
  const response = await fetch(`${BASE_URL}/${cartId}/adicionar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });

  return handleApiResponse(response);
};

export const DeletarItem = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/remover/${productId}`, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  });

  return handleApiResponse(response);
};

export const incrementarQuantidade = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/incrementar/${productId}`, {
    method: "PATCH",
    headers: { "Accept": "application/json" },
  });
  
  return handleApiResponse(response);
};

export const decrementarQuantidade = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/decrementar/${productId}`, {
    method: "PATCH",
    headers: { "Accept": "application/json" },
  });
  
  return handleApiResponse(response);
};

export const LimparCarrinho = async (cartId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/limpar`, {
    method: 'DELETE',
    headers: { "Accept": "application/json" },
  });

  return handleApiResponse(response);
};

// **NOVAS FUNÇÕES PARA MESCLAGEM**

export const obterCarrinhoPorUsuario = async (userId: number): Promise<ICart | null> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}`);
    if (response.status === 404) {
      console.log(`Carrinho não encontrado para o usuário ${userId}.`);
      return null; // Carrinho não encontrado para este usuário
    }
    return await handleApiResponse(response) as ICart; // Garante que o retorno é do tipo ICart
  } catch (error) {
    console.error("Erro ao obter carrinho por usuário:", error);
    throw error;
  }
};

export const mergeCarts = async (cartId: number, tempItems: ICartItem[]): Promise<ICart> => {
  const payload = {
    // Certifique-se de que os itens enviados correspondem ao formato esperado pelo seu backend
    items: tempItems.map(item => ({ productId: item.productId, quantity: item.quantity }))
  };
  const response = await fetch(`${BASE_URL}/${cartId}/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return await handleApiResponse(response) as ICart; // Garante que o retorno é do tipo ICart
};