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
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

export const criarCarrinhoComItem = async ({ 
  productId, 
  quantity 
}: { 
  productId: number; 
  quantity: number 
}) => {
  const response = await fetch(`${BASE_URL}/criar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
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

