import React, { useRef } from 'react';
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import fhone from '../assets/imagens/photo.png';
import ruido from '../assets/imagens/ruido.png';
import headset from '../assets/imagens/gamer.png';
// Importe as outras imagens se elas estiverem em src/assets/imagens/
// import sportEarbuds from '../assets/imagens/headphones-example.png'; // Exemplo
// import studioMonitors from '../assets/imagens/studio-monitors.png'; // Exemplo
// import kidsHeadset from '../assets/imagens/kids-headset.png'; // Exemplo


import { criarCarrinhoComItem, adicionarItemAoCarrinho } from '../services/cartApi';

interface Product {
  id: number;
  img: string;
  name: string;
  subTitle: string;
  features: string[];
  preco: number;
}

const Products = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleToCart = async (product: Product) => {
    try {
      let cartId = localStorage.getItem("cartId");

      if (cartId) {
        await adicionarItemAoCarrinho(cartId, {
          productId: product.id,
          quantity: 1
        });
      } else {
        const response = await criarCarrinhoComItem({
          productId: product.id,
          quantity: 1
        });

        cartId = response.cartId || response.cart?.id;
        if (cartId) localStorage.setItem("cartId", cartId.toString());
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: product.preco,
        img: product.img,
        quantity: 1
      });

      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error("Erro ao adicionar ao carrinho");
    }
  };

  const handleBuyNow = (product: Product) => {
    console.log(`Comprando agora: ${product.name}`);
    toast.info(`Funcionalidade "Comprar agora" para ${product.name} não implementada.`);
  };

  const products: Product[] = [
    {
      id: 1,
      img: fhone,
      name: "Wireless Headphones",
      subTitle: "with Dolby Surround Sound",
      features: [
        "Truly Wireless",
        "Dolby Surround Sound",
        "13hrs of playback time",
        "Made in Germany",
      ],
      preco: 145,
    },
    {
      id: 2,
      img: ruido,
      name: "Noise Cancelling Pro",
      subTitle: "Ultimate sound isolation",
      features: [
        "Active Noise Cancellation",
        "20hrs of battery",
        "Ergonomic design",
        "Smart touch controls",
      ],
      preco: 250,
    },
    {
      id: 3,
      img: headset,
      name: "Gaming Headset X",
      subTitle: "for competitive players",
      features: [
        "Immersive 7.1 Surround",
        "Retractable Mic",
        "Customizable RGB",
        "Lightweight and durable",
      ],
      preco: 150,
    },
    {
      id: 4,
      // **Atenção:** Verifique o caminho da imagem. Se estiver em 'src/assets/imagens/', importe-a como as outras.
      // Caso contrário, certifique-se de que o caminho 'public/images/headphones-example.png' esteja correto e o arquivo exista.
      img: "/images/headphones-example.png",
      name: "Sport Earbuds Fit",
      subTitle: "secure fit for active life",
      features: [
        "Sweatproof & Waterproof",
        "Secure Fit",
        "Long battery life (8hrs)",
        "Ambient sound mode",
      ],
      preco: 120,
    },
    {
      id: 5,
      // **Atenção:** Verifique o caminho da imagem.
      img: "/images/headphones-example.png",
      name: "Studio Monitors Pro",
      subTitle: "precision audio for creators",
      features: [
        "Flat Frequency Response",
        "High-res Audio",
        "Robust build quality",
        "Ideal for mixing/mastering",
      ],
      preco: 300,
    },
    {
      id: 6,
      // **Atenção:** Verifique o caminho da imagem.
      img: "/images/headphones-example.png",
      name: "Kids Safe Headset",
      subTitle: "volume limited for young ears",
      features: [
        "Volume Limited (85dB)",
        "Durable & Flexible",
        "Soft Ear Cushions",
        "Fun colors & designs",
      ],
      preco: 80,
    },
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
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
        <h2 className="text-3xl font-bold text-center mb-10 text-white">Popular Trends</h2>

        <div className="relative mt-16">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-opacity-70 text-white p-3 rounded-full z-10"
            aria-label="Scroll left"
          >
            <FaChevronLeft className="text-xl" />
          </button>

          <div
            ref={scrollContainerRef}
            // Aumentei o espaço horizontal entre os cards de 'space-x-6' para 'space-x-12'
            // Isso dará mais espaço quando os cards escalarem.
            className="flex overflow-x-auto  py-16  space-x-12 pb-4 scrollbar-hide"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-72 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl group relative z-0 hover:z-10"
              >
                <div className="w-full border border-white bg-gradient-to-t from-[#333333] to-[#2E2E2E] rounded-3xl overflow-hidden shadow-lg h-full">
                  <div className="bg-gradient-to-t from-drak-gray to-[#2E2E2E] p-6 flex items-center justify-center h-48 rounded-t-3xl">
                    <img src={product.img} alt={product.name} className="max-w-full h-full object-contain" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                    <h4 className="text-sm text-gray-400 mb-3">{product.subTitle}</h4>

                    <ul className="list-disc list-inside pl-5 text-xs text-gray-400 mb-4">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>

                    <div className="flex flex-col space-y-3">
                      <p className="text-orange-400 text-lg font-medium tracking-wide">
                        ${product.preco}
                      </p>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToCart(product)}
                          className="relative overflow-hidden group flex-1 flex items-center justify-center space-x-1
                            bg-gradient-to-br from-orange-500 to-amber-600 text-white px-3 py-1.5 rounded-full
                            text-xs font-medium hover:shadow-md hover:shadow-orange-500/20
                            transition-all duration-250"
                        >
                          <FaShoppingCart className="text-xs mr-1" />
                          <span className="relative z-10">Add to cart</span>
                        </button>

                        <button
                          onClick={() => handleBuyNow(product)}
                          className="relative overflow-hidden group flex-1 flex items-center justify-center
                            bg-gradient-to-br from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-full
                            text-xs font-semibold hover:shadow-md hover:shadow-amber-500/20
                            transition-all duration-250"
                        >
                          <span className="relative z-10">Buy now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-opacity-70 text-white p-3 rounded-full z-10"
            aria-label="Scroll right"
          >
            <FaChevronRight className="text-xl" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Products;