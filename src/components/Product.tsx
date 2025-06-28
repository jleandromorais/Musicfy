import React, { useRef } from 'react'; // Importe useRef do React
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importe os ícones de seta e carrinho
// Biblioteca para animações ao rolar a página (Animate On Scroll).
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Products = () => {
    const navigate =useNavigate(); // Hook para navegação, se necessário
    const {addToCart} = useCart(); // Hook para adicionar produtos ao carrinho, se necessário
    // Interface para a estrutura do produto

   const handleToCart = (product: Product) => {
  addToCart({
    prductId :product.id,
    name: product.name,
    price: product.preco,
    img: product.img,
  });
   console.log("Enviando para addToCart:")
   console.log("Item productid enviado com valor:", product.id);
  toast.success(`${product.name} adicionado ao carrinho!`);
};


     const handleBuyNow = (product: Product) => {
    addToCart({
      ProductId: product.id,
      name: product.name,
      price: product.preco,
      img: product.img,
    });
    navigate('/cart'); // Redireciona para o carrinho
  };
    interface Product {
      id: number; 
        img: string; // Caminho para a imagem do produto
        name: string;
        subTitle: string;
        features: string[];
        preco: number;
    }
    

    // Lista de produtos (dados de exemplo)
    const products: Product[] = [
        {
            id: 1,
            img: "/images/headphones-example.png", // <--- AJUSTE PARA O CAMINHO REAL DA SUA IMAGEM
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
            img: "/images/headphones-example.png", // <--- AJUSTE PARA O CAMINHO REAL DA SUA IMAGEM
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
            img: "/images/headphones-example.png", // <--- AJUSTE PARA O CAMINHO REAL DA SUA IMAGEM
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
            img: "/images/headphones-example.png", // <--- AJUSTE PARA O CAMINHO REAL DA SUA IMAGEM
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
            img: "/images/headphones-example.png", // <--- AJUSTE PARA O CAMINHO REAL DA SUA IMAGEM
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
            img: "/images/headphones-example.png", // <--- AJUSTE PARA O CAMINHO REAL DA SUA IMAGEM
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
    


   
    // Cria uma referência para a div que conterá os cards e será rolada
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Função para rolar para a esquerda
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            // Rola 300px para a esquerda. Ajuste '300' se quiser rolar mais ou menos.
            scrollContainerRef.current.scrollBy({
                left: -300, 
                behavior: 'smooth' // Rola suavemente
            });
        }
    };

    // Função para rolar para a direita
    const scrollRight = () => {
        if (scrollContainerRef.current) {
            // Rola 300px para a direita. Ajuste '300' se quiser rolar mais ou menos.
            scrollContainerRef.current.scrollBy({
                left: 300, 
                behavior: 'smooth'
            });
        }
    };

    return (
        // Seção principal de Produtos. py-16 para padding vertical, bg-black para o fundo.
        <section className="relative w-full py-16 px-4 md:px-0 overflow-hidden text-white bg-black">
            <div className="container mx-auto px-4 py-12">
                {/* Título da Seção */}
                <h2 className="text-3xl font-bold text-center mb-10 text-white">Popular Trends</h2>
                
                {/* Wrapper para o carrossel de produtos e setas de navegação */}
                {/* 'relative' é essencial para posicionar as setas 'absolute' em relação a este div */}
                <div className="relative">
                    {/* Seta de Navegação para a Esquerda */}
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2  bg-opacity-70 text-white p-3 rounded-full z-10 "
                        aria-label="Scroll left" // Acessibilidade
                    >
                        <FaChevronLeft className="text-xl" />
                    </button>

                    {/* Container de Rolagem Horizontal para os Cards de Produto */}
                    {/* 'ref={scrollContainerRef}' conecta este div ao nosso useRef para controle de rolagem */}
                    {/* 'flex' para exibir os cards um ao lado do outro */}
                    {/* 'overflow-x-auto' permite a rolagem horizontal quando o conteúdo exceder a largura */}
                    {/* 'space-x-6' para espaçamento horizontal entre os cards (24px) */}
                    {/* 'pb-4' para dar espaço para a barra de rolagem (se não for escondida) */}
                    {/* 'scrollbar-hide' (opcional) tenta esconder a barra de rolagem nativa. Requer o plugin `tailwind-scrollbar-hide` */}
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
                    >
                        {/* Mapeia sobre o array de produtos para renderizar cada card */}
                        {products.map((product) => (
                            <div
                                key={product.id} // Chave única para cada item na lista (importante para React)
                                className="flex-shrink-0 w-72 
                                border border-white
            bg-gradient-to-t from-[#333333] to-[#2E2E2E] 
            rounded-3xl overflow-hidden shadow-lg 
            transform transition-transform duration-300 
            hover:scale-105 hover:shadow-xl group"
                            >
                                {/* Área da Imagem do Produto */}
                                <div className=" bg-gradient-to-t from-drak-gray to-[#2E2E2E] p-6 flex items-center justify-center h-48 rounded-t-3xl">
                                    <img src={product.img} alt={product.name} className="max-w-full h-full object-contain" />
                                </div>
                                
                                {/* Conteúdo do Card (Texto, Preço, Botões) */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                                    <h4 className="text-sm text-gray-400 mb-3">{product.subTitle}</h4>
                                    
                                    {/* Lista de Features */}
                                    <ul className="list-disc pl-5 text-xs text-gray-400 mb-4">
                                        {product.features.map((feature, index) => (
                                            <li key={index}>{feature}</li> // key para itens da lista
                                        ))}
                                    </ul>

                                    {/* Preço e Botões */}
                                    <div className="flex flex-col space-y-3">
                                        <p className="text-orange-400 text-lg font-medium tracking-wide">
                                            ${product.preco}
                                            {/* Preço Antigo (se existir) */}
                                           
                                        </p>
                                        
                                        {/* Container dos botões de ação do card */}
                                        <div className="flex space-x-2">
                                            {/* Botão Add to Cart */}
                                            <button
                                                 onClick={()=>handleToCart(product)}
                                                className="relative overflow-hidden group flex-1 flex items-center justify-center space-x-1
                                                           bg-gradient-to-br from-orange-500 to-amber-600 text-white px-3 py-1.5 rounded-full
                                                           text-xs font-medium hover:shadow-md hover:shadow-orange-500/20
                                                           transition-all duration-250"
                                            >
                                                {/* Efeito de brilho sutil (você pode precisar de animações customizadas no tailwind.config.js para 'animate-shine-x') */}
                                                {/* <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(251,191,36,0.3)_50%,transparent_75%)] opacity-70 group-hover:opacity-100 group-hover:animate-shine-x"></span> */}
                                                
                                                <FaShoppingCart className="text-xs mr-1" />
                                                <span className="relative z-10">Add to cart</span>
                                            </button>

                                            {/* Botão Buy Now */}
                                            <button
                                       onClick={() => handleBuyNow(product)}
                                                className="relative overflow-hidden group flex-1 flex items-center justify-center
                                                           bg-gradient-to-br from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-full
                                                           text-xs font-semibold hover:shadow-md hover:shadow-amber-500/20
                                                           transition-all duration-250 "
                                            >
                                                {/* Efeito de brilho (você pode precisar de animações customizadas) */}
                                                {/* <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(252,211,77,0.3)_0%,transparent_70%)] opacity-50 group-hover:opacity-70"></span> */}
                                                <span className="relative z-10">Buy now</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Seta de Navegação para a Direita */}
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-opacity-70 text-white p-3 rounded-full z-10 "
                        aria-label="Scroll right" // Acessibilidade
                    >
                        <FaChevronRight className="text-xl" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Products;