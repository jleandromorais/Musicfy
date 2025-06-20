export async function adicionarAoCarrinho(id: number) {
  const response = await fetch(`http://localhost:8080/cart?id=${id}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Erro ao adicionar');
  const itens = await response.json();
  return itens;
}

export async function removerDoCarrinho(id: number) {
  const response = await fetch(`http://localhost:8080/cart/delete?id=${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Erro ao remover');
  const itens = await response.json();
  return itens;
}