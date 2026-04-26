import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Navbar from '../components/NavbarE';
import Footer from '../components/footer';
import { fetchProduct, fetchProducts, type Product } from '../services/productApi';
import { useCart } from '../contexts/CartContext';
import { criarCarrinhoComItem, adicionarItemAoCarrinho } from '../services/cartApi';

import fhone from '../assets/imagens/photo.png';
import headset from '../assets/imagens/gamer.png';
import foneEsportivo from '../assets/imagens/fone-esportivo.png';
import caixa from '../assets/imagens/59679_caixa-jbl-308p-mkii-monitor-de-estudio-ativo-pr-15707-28913048_s1_637734070885381143-removebg-preview.png';

const categoryFallback: Record<string, string> = {
  fones: fhone,
  headsets: headset,
  caixas_som: caixa,
  acessorios: foneEsportivo,
};

const CAT_LABEL: Record<string, string> = {
  fones: 'Fones',
  headsets: 'Headsets',
  caixas_som: 'Caixas de Som',
  acessorios: 'Acessórios',
};

const resolveImage = (p: Product) =>
  p.imagem_url || categoryFallback[p.categoria] || fhone;

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, setCartId } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQuantity(1);
    fetchProduct(Number(id))
      .then(async (p) => {
        setProduct(p);
        const all = await fetchProducts(p.categoria);
        setRelated(all.filter((r) => r.id !== p.id).slice(0, 4));
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async (prod: Product, qty = quantity, redirect = false) => {
    setAddingToCart(true);
    try {
      let cartId = localStorage.getItem('cartId');
      if (cartId) {
        for (let i = 0; i < qty; i++) {
          await adicionarItemAoCarrinho(cartId, { productId: prod.id, quantity: 1 });
        }
      } else {
        const res = await criarCarrinhoComItem({ productId: prod.id, quantity: qty }) as any;
        cartId = res.cartId || res.cart?.id;
        if (cartId) {
          localStorage.setItem('cartId', cartId.toString());
          setCartId(parseInt(cartId, 10));
        }
      }
      addToCart({ id: prod.id, name: prod.nome, price: prod.preco, img: resolveImage(prod) });
      toast.success(`${prod.nome} adicionado ao carrinho!`);
      if (redirect) navigate('/cart');
    } catch {
      toast.error('Erro ao adicionar ao carrinho');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A002F]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2 h-96 bg-gray-800/50 rounded-3xl animate-pulse" />
          <div className="lg:w-1/2 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-800/50 rounded-xl animate-pulse" style={{ width: `${80 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inStock = product.estoque > 0;

  return (
    <div className="min-h-screen bg-[#1A002F] text-white">
      <Navbar />

      {/* bg glows */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full bg-[#F14A16] opacity-5 filter blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#35589A] opacity-10 filter blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors mb-8 font-medium text-sm"
        >
          <FaArrowLeft /> Voltar
        </button>

        {/* Product section */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Imagem */}
          <div className="lg:w-1/2">
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden border border-white/10 aspect-square flex items-center justify-center p-10">
              <div className="absolute inset-0 bg-[#F14A16] opacity-5 blur-3xl rounded-3xl" />
              <img
                src={resolveImage(product)}
                alt={product.nome}
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Info */}
          <div className="lg:w-1/2 flex flex-col justify-center space-y-6">
            {/* Categoria */}
            <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-[#35589A]/20 text-[#7ba6f0] border border-[#35589A]/30">
              {CAT_LABEL[product.categoria] ?? product.categoria}
            </span>

            {/* Nome */}
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              {product.nome}
            </h1>

            {/* Preço */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-orange-400">
                R$ {product.preco.toFixed(2)}
              </span>
              <span className="text-gray-500 text-sm">à vista</span>
            </div>

            {/* Descrição */}
            {product.descricao && (
              <p className="text-gray-400 leading-relaxed">{product.descricao}</p>
            )}

            {/* Estoque */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={inStock ? 'text-green-400' : 'text-red-400'}>
                {inStock ? `${product.estoque} em estoque` : 'Sem estoque'}
              </span>
            </div>

            {/* Quantidade */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm font-medium">Quantidade:</span>
                <div className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    <FaMinus size={12} />
                  </button>
                  <span className="text-white font-bold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.estoque, q + 1))}
                    className="text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleAddToCart(product)}
                disabled={!inStock || addingToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600 text-white font-semibold py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaShoppingCart />
                {addingToCart ? 'Adicionando...' : 'Adicionar ao carrinho'}
              </button>
              <button
                onClick={() => handleAddToCart(product, quantity, true)}
                disabled={!inStock || addingToCart}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inStock ? 'Comprar agora' : 'Sem estoque'}
              </button>
            </div>
          </div>
        </div>

        {/* Produtos relacionados */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8 text-white">
              Mais em <span className="text-orange-400">{CAT_LABEL[product.categoria]}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:bg-gray-800/60 transition-all group"
                >
                  <div className="h-40 flex items-center justify-center p-4 bg-gradient-to-b from-gray-800/50 to-transparent">
                    <img
                      src={resolveImage(p)}
                      alt={p.nome}
                      className="h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-white font-semibold text-sm truncate">{p.nome}</p>
                    <p className="text-orange-400 font-bold mt-1">R$ {p.preco.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
