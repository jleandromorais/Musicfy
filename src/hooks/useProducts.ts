import { useState, useEffect } from 'react';
import { fetchProducts, type Product } from '../services/productApi';

interface State {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const useProducts = (categoria?: string) => {
  const [state, setState] = useState<State>({ products: [], loading: true, error: null });

  useEffect(() => {
    let active = true;

    setState({ products: [], loading: true, error: null });

    fetchProducts(categoria)
      .then((data) => {
        if (active) setState({ products: data, loading: false, error: null });
      })
      .catch((err) => {
        if (active)
          setState({
            products: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido',
          });
      });

    return () => {
      active = false;
    };
  }, [categoria]);

  return { ...state, isEmpty: state.products.length === 0 && !state.loading };
};
