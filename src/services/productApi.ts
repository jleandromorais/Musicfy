const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Product {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  categoria: 'fones' | 'headsets' | 'caixas_som' | 'acessorios';
  estoque: number;
}

export const fetchProducts = async (categoria?: string): Promise<Product[]> => {
  const url = new URL(`${API_URL}/api/products`);
  if (categoria) url.searchParams.set('categoria', categoria);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Erro ao buscar produtos');
  return response.json();
};

export const fetchProduct = async (id: number): Promise<Product> => {
  const response = await fetch(`${API_URL}/api/products/${id}`);
  if (!response.ok) throw new Error('Produto não encontrado');
  return response.json();
};
