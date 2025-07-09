/*
import { useState, useEffect } from 'react';
// IMPORTAR Product e fetchProducts do serviço da API simulada
import { Product, fetchProducts } from '../services/api';  // ajuste o caminho conforme seu projeto

// Hook customizado para buscar e gerenciar produtos
export const useProducts = () => {
  const [state, setState] = useState<{
    products: Product[];
    loading: boolean;
    error: string | null;
  }>({
    products: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchProducts();
        if (isMounted) {
          setState(prev => ({
            ...prev,
            products: data,
            loading: false,
            error: null,
          }));
        }
      } catch (err) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            products: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido',
          }));
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Funções para adicionar e remover do carrinho (exporte se for usar fora)
  async function adicionarAoCarrinho(id: number) {
    const response = await fetch(`http://localhost:8080/cart?id=${id}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Erro ao adicionar');
    const itens = await response.json();
    return itens;
  }

  async function removerDoCarrinho(id: number) {
    const response = await fetch(`http://localhost:8080/cart/delete?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao remover');
    const itens = await response.json();
    return itens;
  }

  return {
    products: state.products,
    loading: state.loading,
    error: state.error,
    isEmpty: state.products.length === 0 && !state.loading,
    adicionarAoCarrinho,
    removerDoCarrinho,
  };
};
*/