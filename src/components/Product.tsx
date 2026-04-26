import { useRef, useState } from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';
import { FaShoppingCart, FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../services/productApi';

import 'react-toastify/dist/ReactToastify.css';
import fhone from '../assets/imagens/photo.png';
import headset from '../assets/imagens/gamer.png';
import foneEsporivo from '../assets/imagens/fone-esportivo.png';
import caixa from '../assets/imagens/59679_caixa-jbl-308p-mkii-monitor-de-estudio-ativo-pr-15707-28913048_s1_637734070885381143-removebg-preview.png';

import { criarCarrinhoComItem, adicionarItemAoCarrinho } from '../services/cartApi';

const categoryFallback: Record<string, string> = {
  fones: fhone,
  headsets: headset,
  caixas_som: caixa,
  acessorios: foneEsporivo,
};

const Produtos = () => {
  const navigate = useNavigate();
  const { addToCart, setCartId } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { products, loading, error } = useProducts();

  const resolveImage = (produto: Product) =>
    produto.imagem_url || categoryFallback[produto.categoria] || fhone;

  const adicionarAoCarrinho = async (produto: Product) => {
    try {
      let currentCartId = localStorage.getItem('cartId');

      if (currentCartId) {
        await adicionarItemAoCarrinho(currentCartId, { productId: produto.id, quantity: 1 });
      } else {
        const response = await criarCarrinhoComItem({ productId: produto.id, quantity: 1 }) as any;
        currentCartId = response.cartId || response.cart?.id;
        if (currentCartId) {
          localStorage.setItem('cartId', currentCartId.toString());
          setCartId(parseInt(currentCartId, 10));
        }
      }

      addToCart({ id: produto.id, name: produto.nome, price: produto.preco, img: resolveImage(produto) });
      toast.success(`${produto.nome} adicionado ao carrinho!`);
    } catch {
      toast.error('Erro ao adicionar ao carrinho');
    }
  };

  const comprarAgora = async (produto: Product) => {
    try {
      let currentCartId = localStorage.getItem('cartId');

      if (currentCartId) {
        await adicionarItemAoCarrinho(currentCartId, { productId: produto.id, quantity: 1 });
      } else {
        const response = await criarCarrinhoComItem({ productId: produto.id, quantity: 1 }) as any;
        currentCartId = response.cartId || response.cart?.id;
        if (currentCartId) {
          localStorage.setItem('cartId', currentCartId.toString());
          setCartId(parseInt(currentCartId, 10));
        }
      }

      addToCart({ id: produto.id, name: produto.nome, price: produto.preco, img: resolveImage(produto) });
      toast.success(`${produto.nome} adicionado ao carrinho!`);
      navigate('/cart');
    } catch {
      toast.error('Erro ao comprar agora');
    }
  };

  const produtosFiltrados = products.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  const rolarEsquerda = () => scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const rolarDireita = () => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  const mostrarSetas = !loading && produtosFiltrados.length > 0;

  return (
    <section className="relative w-full py-16 px-4 md:px-0 overflow-hidden text-white bg-black">
      <ToastContainer position="bottom-right" />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">Tendências Populares</h2>

        {!loading && !error && (
          <div className="relative max-w-md mx-auto mb-2">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full bg-[#1A1A1A] border border-gray-700 text-white placeholder-gray-500
                         rounded-full py-2.5 pl-10 pr-10 text-sm
                         focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500
                         transition-colors duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs"
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="text-center text-red-400 py-8">Erro ao carregar produtos: {error}</p>
        )}

        <div className="relative mt-16">
          <button
            onClick={rolarEsquerda}
            style={{ display: mostrarSetas ? undefined : 'none' }}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-opacity-70 text-white p-3 rounded-full z-10"
            aria-label="Rolar para esquerda"
          >
            <FaChevronLeft className="text-xl" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto py-16 space-x-12 pb-4 scrollbar-hide"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : produtosFiltrados.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 min-w-full gap-3">
                <FaSearch className="text-5xl text-gray-700" />
                <p className="text-gray-300 text-lg font-semibold">Nenhum produto encontrado</p>
                {searchTerm && (
                  <>
                    <p className="text-gray-600 text-sm">
                      Nenhum resultado para{' '}
                      <span className="text-orange-400 font-medium">"{searchTerm}"</span>
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-xs text-orange-500 hover:text-orange-400 underline underline-offset-2 transition-colors"
                    >
                      Limpar busca
                    </button>
                  </>
                )}
              </div>
            ) : (
              produtosFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="flex-shrink-0 w-72 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl group relative z-0 hover:z-10"
                >
                  <div className="w-full border border-white bg-gradient-to-t from-[#333333] to-[#2E2E2E] rounded-3xl overflow-hidden shadow-lg h-full">
                    <div
                      className="bg-gradient-to-t from-drak-gray to-[#2E2E2E] p-6 flex items-center justify-center h-48 rounded-t-3xl cursor-pointer"
                      onClick={() => navigate(`/products/${produto.id}`)}
                    >
                      <img
                        src={resolveImage(produto)}
                        alt={produto.nome}
                        className="max-w-full h-full object-contain"
                      />
                    </div>

                    <div className="p-6">
                      <h3
                        className="text-lg font-bold mb-1 cursor-pointer hover:text-orange-400 transition-colors"
                        onClick={() => navigate(`/products/${produto.id}`)}
                      >
                        {produto.nome}
                      </h3>
                      {produto.descricao && (
                        <h4 className="text-sm text-gray-400 mb-3">{produto.descricao}</h4>
                      )}

                      <div className="flex flex-col space-y-3 mt-4">
                        <p className="text-orange-400 text-lg font-medium tracking-wide">
                          R${produto.preco.toFixed(2)}
                        </p>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => adicionarAoCarrinho(produto)}
                            disabled={produto.estoque === 0}
                            className="relative overflow-hidden group flex-1 flex items-center justify-center space-x-1
                              bg-gradient-to-br from-orange-500 to-amber-600 text-white px-3 py-1.5 rounded-full
                              text-xs font-medium hover:shadow-md hover:shadow-orange-500/20
                              transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaShoppingCart className="text-xs mr-1" />
                            <span className="relative z-10">Adicionar ao carrinho</span>
                          </button>

                          <button
                            onClick={() => comprarAgora(produto)}
                            disabled={produto.estoque === 0}
                            className="relative overflow-hidden group flex-1 flex items-center justify-center
                              bg-gradient-to-br from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-full
                              text-xs font-semibold hover:shadow-md hover:shadow-amber-500/20
                              transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="relative z-10">
                              {produto.estoque === 0 ? 'Sem estoque' : 'Comprar agora'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={rolarDireita}
            style={{ display: mostrarSetas ? undefined : 'none' }}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-opacity-70 text-white p-3 rounded-full z-10"
            aria-label="Rolar para direita"
          >
            <FaChevronRight className="text-xl" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Produtos;
