const BASE_URL = "http://localhost:8080/api/carrinho";

export const criarCarrinhoComItem = async ({ productId, quantity }: { productId: number; quantity: number }) => {
  const response = await fetch(`${BASE_URL}/criar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) throw new Error("Erro ao criar carrinho");

  return response.json(); // certifique-se que o backend está retornando { cartId: 1 } ou similar
};

export const adicionarItemAoCarrinho = async (cartId: string, { productId, quantity }: { productId: number; quantity: number }) => {
  const response = await fetch(`${BASE_URL}/${cartId}/adicionar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) throw new Error("Erro ao adicionar item ao carrinho");

  return response.json(); // opcional
};

export const DeletarItem = async (cartId: string, productId: number) => {
  const response = await fetch(`http://localhost:8080/api/carrinho/${cartId}/remover/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    // Aqui lança o erro, você pode logar response.status e response.statusText para mais detalhes
    const errorText = await response.text();
    console.error('Erro no DELETE:', response.status, response.statusText, errorText);
    throw new Error("Erro ao deletar item do carrinho");
  }

  return response.text();
};
export const incrementarQuantidade = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/incrementar/${productId}`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Erro ao incrementar quantidade");
};

export const decrementarQuantidade = async (cartId: string, productId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/decrementar/${productId}`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Erro ao decrementar quantidade");
};



export const LimparCarrinho = async (cartId: number) => {
  const response = await fetch(`${BASE_URL}/${cartId}/limpar`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Erro ao limpar carrinho');
  return await response.json();
};