import React from 'react';
import { FaShoppingCart, FaArrowDown } from 'react-icons/fa';

const HeroSection: React.FC = () => {
  return (
    // ESTA LINHA ESTÁ CORRETA PARA TELA CHEIA. O PROBLEMA ESTÁ FORA DESTE ARQUIVO.
    <section className="relative w-full h-screen bg-black flex items-center justify-center px-4 md:px-0 overflow-hidden">

      {/* Círculos de fundo */}
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] md:w-[1500px] md:h-[1500px] rounded-full bg-[#F14A16] opacity-10 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] lg:w-[800px] lg:h-[800px] rounded-full bg-[#35589A] opacity-70 filter blur-[100px] transform -translate-x-1/2 -translate-y-1/2 z-0 animate-pulse"></div>
      <div className="absolute top-80 left-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] lg:w-[800px] lg:h-[800px] rounded-full bg-[#370665] opacity-70 filter blur-[100px] transform -translate-y-1/2 z-0 animate-pulse"></div>

      {/* Imagem da mulher */}
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden hidden md:block z-0"> 
        <img 
          src="/Woman.svg"
          alt="Mulher com fones de ouvido"
          className="w-full h-full object-cover object-right"
        />
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 w-full">
        
        {/* Coluna Esquerda */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left p-4 md:p-8">
          <h2 className="text-white text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Let's Dive in <br />
            <span className="text-[#F14A16]">Music World</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit...
          </p>

          {/* Container dos botões */}
          <div className="flex space-x-4">
            <div className='relative'>
              <button className="bg-[#F14A16] text-white px-8 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors ring-2 ring-[#F14A16] ring-opacity-50 hover:ring-opacity-100">
                Shop now
              </button>
              <a href="#next-section" className="absolute left-8 top-32 mt-2 transform -translate-x-1/2 text-white text-3xl hover:text-orange-500 animate-bounce">
                <FaArrowDown />
              </a>
            </div>
            <button className="border border-[#F14A16] text-[#F14A16] px-6 py-3 rounded-md font-semibold flex items-center space-x-2 hover:bg-[#F14A16] hover:text-white transition-colors">
              <FaShoppingCart className="text-lg" />
              <span>Add to cart</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita: Cards de Produto */}
        <div className="w-full md:w-1/2 hidden md:block">
          <div className="absolute bottom-0 right-0 -mb-[102px] mr-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 justify-end items-end p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg flex items-center justify-center flex-col w-40 transform transition-all hover:scale-105 hover:bg-opacity-20">
                <img src="../fone.svg" alt="Fone" className="w-24 h-24 object-contain mb-2" />
                <p className="text-white text-sm font-semibold">Wireless Headphones</p>
                <p className="text-gray-400 text-xs line-through">$180</p>
                <p className="text-[#F14A16] text-base font-bold">$185</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;