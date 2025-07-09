// src/components/Product.tsx
import  { useRef } from 'react';
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';

import 'react-toastify/dist/ReactToastify.css';
import fhone from '../assets/imagens/photo.png';
import ruido from '../assets/imagens/ruido.png';
import headset from '../assets/imagens/gamer.png';
import foneEsporivo from '../assets/imagens/fone-esportivo.png';
import caixa from '../assets/imagens/59679_caixa-jbl-308p-mkii-monitor-de-estudio-ativo-pr-15707-28913048_s1_637734070885381143-removebg-preview.png'
import infatil from '../assets/imagens/1449122-800-auto-removebg-preview.png';

import { criarCarrinhoComItem, adicionarItemAoCarrinho } from '../services/cartApi';

interface Produto {
  id: number;
  img: string;
  nome: string;
  subtitulo: string;
  caracteristicas: string[];
  preco: number;
}

const Produtos = () => {
  const navigate = useNavigate();
  // Adicione setCartId aqui para que você possa atualizar o contexto
  const { addToCart, setCartId } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const adicionarAoCarrinho = async (produto: Produto) => {
  try {
    let currentCartId = localStorage.getItem("cartId");

    if (currentCartId) {
      await adicionarItemAoCarrinho(currentCartId, {
        productId: produto.id,
        quantity: 1
      });
    } else {
      const response = await criarCarrinhoComItem({
        productId: produto.id,
        quantity: 1
      });

      currentCartId = response.cartId || response.cart?.id;
      if (currentCartId) {
        localStorage.setItem("cartId", currentCartId.toString());
        setCartId(parseInt(currentCartId, 10));
      }
    }

    // Aqui, passe somente as propriedades do produto (sem quantity)
    addToCart({
      id: produto.id,
      name: produto.nome,
      price: produto.preco,
      img: produto.img,
    });

    toast.success(`${produto.nome} adicionado ao carrinho!`);
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    toast.error("Erro ao adicionar ao carrinho");
  }
};

  const comprarAgora = async (produto: Produto) => {
  try {
    let currentCartId = localStorage.getItem("cartId");

    if (currentCartId) {
      await adicionarItemAoCarrinho(currentCartId, {
        productId: produto.id,
        quantity: 1
      });
    } else {
      const response = await criarCarrinhoComItem({
        productId: produto.id,
        quantity: 1
      });

      currentCartId = response.cartId || response.cart?.id;
      if (currentCartId) {
        localStorage.setItem("cartId", currentCartId.toString());
        setCartId(parseInt(currentCartId, 10));
      }
    }

    addToCart({
      id: produto.id,
      name: produto.nome,
      price: produto.preco,
      img: produto.img,
    });

    toast.success(`${produto.nome} adicionado ao carrinho!`);

    // Redireciona para o checkout após adicionar ao carrinho
    navigate("/cart");
  } catch (error) {
    console.error("Erro ao comprar agora:", error);
    toast.error("Erro ao comprar agora");
  }
};
  const produtos: Produto[] = [
    {
      id: 1,
      img: fhone,
      nome: "Fones de Ouvido Sem Fio",
      subtitulo: "com Dolby Surround Sound",
      caracteristicas: [
        "Verdadeiramente sem fio",
        "Som Dolby Surround",
        "13 horas de reprodução",
        "Fabricado na Alemanha",
      ],
      preco: 145,
    },
    {
      id: 2,
      img: ruido,
      nome: "Cancelamento de Ruído Pro",
      subtitulo: "Isolamento sonoro máximo",
      caracteristicas: [
        "Cancelamento ativo de ruído",
        "20 horas de bateria",
        "Design ergonômico",
        "Controles touch inteligentes",
      ],
      preco: 250,
    },
    {
      id: 3,
      img: headset,
      nome: "Headset Gamer X",
      subtitulo: "para jogadores competitivos",
      caracteristicas: [
        "Surround 7.1 imersivo",
        "Microfone retrátil",
        "RGB personalizável",
        "Leve e durável",
      ],
      preco: 150,
    },
    {
      id: 4,
      img: foneEsporivo,
      nome: "Fones Esportivos",
      subtitulo: "ajuste seguro para vida ativa",
      caracteristicas: [
        "Resistentes a suor e água",
        "Ajuste seguro",
        "Longa duração de bateria (8hrs)",
        "Modo de som ambiente",
      ],
      preco: 120,
    },
    {
      id: 5,
      img: caixa,
      nome: "Monitores de Estúdio Pro",
      subtitulo: "áudio preciso para criadores",
      caracteristicas: [
        "Resposta de frequência plana",
        "Áudio de alta resolução",
        "Construção robusta",
        "Ideal para mixagem/masterização",
      ],
      preco: 300,
    },
    {
      id: 6,
      img: infatil,
      nome: "Headset Infantil Seguro",
      subtitulo: "volume limitado para ouvidos jovens",
      caracteristicas: [
        "Volume limitado (85dB)",
        "Durável e flexível",
        "Almofadas macias",
        "Cores e designs divertidos",
      ],
      preco: 80,
    },
  ];

  const rolarEsquerda = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const rolarDireita = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full py-16 px-4 md:px-0 overflow-hidden text-white bg-black">
      <ToastContainer position="bottom-right" />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">Tendências Populares</h2>

        <div className="relative mt-16">
          <button
            onClick={rolarEsquerda}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-opacity-70 text-white p-3 rounded-full z-10"
            aria-label="Rolar para esquerda"
          >
            <FaChevronLeft className="text-xl" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto py-16 space-x-12 pb-4 scrollbar-hide"
          >
            {produtos.map((produto) => (
              <div
                key={produto.id}
                className="flex-shrink-0 w-72 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl group relative z-0 hover:z-10"
              >
                <div className="w-full border border-white bg-gradient-to-t from-[#333333] to-[#2E2E2E] rounded-3xl overflow-hidden shadow-lg h-full">
                  <div className="bg-gradient-to-t from-drak-gray to-[#2E2E2E] p-6 flex items-center justify-center h-48 rounded-t-3xl">
                    <img src={produto.img} alt={produto.nome} className="max-w-full h-full object-contain" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1">{produto.nome}</h3>
                    <h4 className="text-sm text-gray-400 mb-3">{produto.subtitulo}</h4>

                    <ul className="list-disc list-inside pl-5 text-xs text-gray-400 mb-4">
                      {produto.caracteristicas.map((caracteristica, index) => (
                        <li key={index}>{caracteristica}</li>
                      ))}
                    </ul>

                    <div className="flex flex-col space-y-3">
                      <p className="text-orange-400 text-lg font-medium tracking-wide">
                        R${produto.preco}
                      </p>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => adicionarAoCarrinho(produto)}
                          className="relative overflow-hidden group flex-1 flex items-center justify-center space-x-1
                            bg-gradient-to-br from-orange-500 to-amber-600 text-white px-3 py-1.5 rounded-full
                            text-xs font-medium hover:shadow-md hover:shadow-orange-500/20
                            transition-all duration-250"
                        >
                          <FaShoppingCart className="text-xs mr-1" />
                          <span className="relative z-10">Adicionar ao carrinho</span>
                        </button>

                        <button
                          onClick={() => comprarAgora(produto)}
                          className="relative overflow-hidden group flex-1 flex items-center justify-center
                            bg-gradient-to-br from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-full
                            text-xs font-semibold hover:shadow-md hover:shadow-amber-500/20
                            transition-all duration-250"
                        >
                          <span className="relative z-10">Comprar agora</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={rolarDireita}
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