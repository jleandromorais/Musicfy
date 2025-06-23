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