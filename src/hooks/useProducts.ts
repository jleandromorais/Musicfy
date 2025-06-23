import { useState, useEffect } from 'react';
// Importa a função para buscar produtos e o TIPO Product da API simulada
// A interface Product será USADA AQUI, mas DEFINIDA e EXPORTADA em '../services/api'

// REMOVA DAQUI: export interface Product { ... }
// A interface Product não deve ser definida neste arquivo.

// Hook customizado para buscar e gerenciar produtos
export const useProducts = () => {
    // Estado local para armazenar produtos, status de carregamento e erro
    const [state, setState] = useState<{
        products: Product[];    // Agora, Product vem da importação de ../services/api
        loading: boolean;
        error: string | null;
    }>({
        products: [],
        loading: true,
        error: null,
    });

    // Efeito para buscar produtos ao montar o componente
    useEffect(() => {
        let isMounted = true; // Controle para evitar atualizar estado após desmontar

        // Função assíncrona para buscar produtos
        const loadProducts = async () => {
            setState(prevState => ({ ...prevState, loading: true, error: null })); // Sempre reinicia erro e loading

            try {
                const data = await fetchProducts(); // Busca produtos da API

                // Só atualiza o estado se o componente ainda estiver montado
                if (isMounted) {
                    setState(prevState => ({
                        ...prevState,
                        products: data,    // Salva os produtos recebidos
                        loading: false,    // Finaliza carregamento
                        error: null,       // Sem erro
                    }));
                }
            } catch (err) {
                // Em caso de erro, atualiza o estado com a mensagem de erro
                if (isMounted) {
                    setState(prevState => ({
                        ...prevState,
                        products: [],      // Lista vazia em caso de erro
                        loading: false,    // Finaliza carregamento
                        error: err instanceof Error ? err.message : 'Erro desconhecido', // Mensagem de erro
                    }));
                }
            }
        };

        loadProducts(); // Executa a busca ao montar

        // Função de limpeza para evitar atualizações após desmontar
        return () => {
            isMounted = false;
        };
    }, []); // Executa apenas uma vez ao montar

    // Retorna os dados e estados úteis para o componente que usar o hook
    return {
        products: state.products,
        loading: state.loading,
        error: state.error,
        isEmpty: state.products.length === 0 && !state.loading, // Indica se está vazio (e não carregando)
    };
    
    
async function adicionarAoCarrinho(id: number) {
  const response = await fetch(`http://localhost:8080/cart?id=${id}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Erro ao adicionar');
  const itens = await response.json();
  return itens; // lista atualizada do carrinho
}
async function removerDoCarrinho(id: number) {
  const response = await fetch(`http://localhost:8080/cart/delete?id=${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Erro ao remover');
  const itens = await response.json();
  return itens; // lista atualizada do carrinho
}
};