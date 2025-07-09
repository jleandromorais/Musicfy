import  { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { criarCarrinhoComItem, adicionarItemAoCarrinho } from '../services/cartApi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhonePLus from '../assets/imagens/foneplus.png';

const ExibicaoProdutoComEfeito = () => {
  const [tempoRestante, setTempoRestante] = useState({
    dias: '02',
    horas: '12',
    minutos: '45',
    segundos: '30'
  });

  const phoneRef = useRef(null);
  const [estaVisivel, setEstaVisivel] = useState(false);
const unidades = ['dias', 'horas', 'minutos', 'segundos'] as const;

type Unidade = typeof unidades[number];
  const { addToCart, setCartId } = useCart();
  const navigate = useNavigate();

  const produto = {
    id: 7,
    nome: "Fone Premium Plus",
    preco: 999.99,
    img: PhonePLus,
    quantity: 1
  };

  // Contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTempoRestante(prev => {
        let { dias, horas, minutos, segundos } = prev;
        let d = parseInt(dias), h = parseInt(horas), 
            m = parseInt(minutos), s = parseInt(segundos);

        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
            else {
              h = 23;
              if (d > 0) d--;
            }
          }
        }

        return {
          dias: d.toString().padStart(2, '0'),
          horas: h.toString().padStart(2, '0'),
          minutos: m.toString().padStart(2, '0'),
          segundos: s.toString().padStart(2, '0')
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animação ao rolar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setEstaVisivel(true);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (phoneRef.current) {
      observer.observe(phoneRef.current);
    }

    return () => {
      if (phoneRef.current) {
        observer.unobserve(phoneRef.current);
      }
    };
  }, [phoneRef]);

  // 👉 Função que adiciona ao carrinho e redireciona para checkout
  const handleComprarAgora = async () => {
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
      navigate("/");

    
    } catch (error) {
      console.error("Erro ao comprar agora:", error);
      toast.error("Erro ao comprar agora");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center p-8 rounded-3xl overflow-hidden">
      <ToastContainer position="bottom-right" />
      <div className="flex flex-col items-center rounded-3xl">

        <div className="relative mb-10 rounded-3xl">
          <div className="w-[400px] h-[400px] bg-blue-500 rounded-full opacity-20 blur-[80px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

          <div className="absolute top-0 right-0 w-[70px] h-[70px] bg-[#370665] rounded-full flex items-center justify-center z-20 transform translate-x-1/4 -translate-y-1/4 shadow-lg">
            <span className="font-bold text-white text-sm">20% OFF</span>
          </div>

          <div
            ref={phoneRef}
            className={`relative w-[300px] h-[300px] flex items-center justify-center z-10 rounded-2xl overflow-hidden transition-all duration-1000 ease-out ${
              estaVisivel ? 'translate-y-0 opacity-100' : 'translate-y-[200px] opacity-0'
            }`}
          >
            <img
              src={PhonePLus}
              alt="Produto Premium"
              className="max-w-full max-h-full object-contain animate-float rounded-2xl"
            />
          </div>
        </div>

        <div className="text-center space-y-6 rounded-3xl p-6 bg-gray-900/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold">Fone Premium Plus</h1>

          <div className="flex items-center justify-center gap-4 rounded-full bg-gray-800/50 p-2">
            <p className="text-3xl text-blue-400 font-medium">R$ 999,99</p>
            <p className="text-xl text-gray-400 line-through">R$ 1.249,99</p>
          </div>

          <div className="py-4 rounded-2xl bg-gray-800/30 p-4">
            <p className="text-blue-300 mb-2">OFERTA TERMINA EM:</p>
            <div className="flex gap-2 justify-center">
             {unidades.map((unidade: Unidade) => (
  <div key={unidade} className="bg-blue-900/50 rounded-full p-3 min-w-[60px]">
    <div className="text-2xl font-mono">{tempoRestante[unidade]}</div>
    <div className="text-xs text-blue-200">{unidade.toUpperCase()}</div>
  </div>

              ))}
            </div>
          </div>

          <button
            onClick={handleComprarAgora}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            Comprar Agora
          </button>
        </div>
      </div>

      <style>{`
        @keyframes flutuar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: flutuar 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ExibicaoProdutoComEfeito;
