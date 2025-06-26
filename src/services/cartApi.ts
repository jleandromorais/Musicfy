export async function adicionarAoCarrinho(item: { productId: number; quantity: number }) {
  const API_URL = 'http://localhost:8080/carrinho/adicionar'; // Endpoint simplificado

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item) // Envia exatamente {productId, quantity}
  });

  if (!response.ok) {
    throw new Error('Falha ao adicionar item');
  }

  return await response.json();
}

export async function DeletarItem(productId: number) {
  const API_URL = `http://localhost:8080/carrinho/RemoverPorProduto/${productId}`;

  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Adicione outros headers se necessário (como Authorization)
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Falha ao deletar item');
  }

  return await response.text(); // Ou response.json() se o backend retornar JSON
}