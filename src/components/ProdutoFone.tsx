import React, { useState, useEffect } from 'react';
import PhonePLus from '../assets/imagens/foneplus.png'; // Certifique-se de que o caminho está correto

const ProductDisplayWithHalo = () => {
  // Estado para o timer
  const [timeLeft, setTimeLeft] = useState({
    days: '02',
    hours: '12',
    minutes: '45',
    seconds: '30'
  });

  // Contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        let d = parseInt(days), h = parseInt(hours), 
            m = parseInt(minutes), s = parseInt(seconds);

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
          days: d.toString().padStart(2, '0'),
          hours: h.toString().padStart(2, '0'),
          minutes: m.toString().padStart(2, '0'),
          seconds: s.toString().padStart(2, '0')
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    // Removemos 'animate-slideInFromBottom' daqui para que apenas a imagem se mova
    <div className="bg-black text-white min-h-screen flex items-center justify-center p-8 rounded-3xl overflow-hidden">
      <div className="flex flex-col items-center rounded-3xl">
        
        {/* Container da Bolha + Foto */}
        <div className="relative mb-10 rounded-3xl">
          {/* Bolha Azul Grande (400x400) - Halo de Luz */}
          <div 
            className="w-[400px] h-[400px] bg-blue-500 rounded-full opacity-20 blur-[80px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          ></div>
          
          {/* Bolha de Desconto (70x70) - Canto superior direito */}
          <div className="absolute top-0 right-0 w-[70px] h-[70px] bg-[#370665] rounded-full flex items-center justify-center z-20 transform translate-x-1/4 -translate-y-1/4 shadow-lg">
            <span className="font-bold text-white text-sm">20% OFF</span>
          </div>
          
          {/* Container da Foto (300x300) */}
          <div className="relative w-[300px] h-[300px] flex items-center justify-center z-10 rounded-2xl overflow-hidden">
            <img
              src={PhonePLus}
              alt="Produto Premium"
              // Adicionamos 'animate-slideInFromBottom' aqui para que apenas o fone de ouvido se mova
              className="max-w-full max-h-full object-contain animate-float animate-slideInFromBottom rounded-2xl"
            />
          </div>
        </div>

        {/* Informações do Produto */}
        <div className="text-center space-y-6 rounded-3xl p-6 bg-gray-900/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold">
            Nome do Produto
          </h1>
          
          <div className="flex items-center justify-center gap-4 rounded-full bg-gray-800/50 p-2">
            <p className="text-3xl text-blue-400 font-medium">
              R$ 999,99
            </p>
            <p className="text-xl text-gray-400 line-through">
              R$ 1.249,99
            </p>
          </div>

          {/* Timer de Oferta */}
          <div className="py-4 rounded-2xl bg-gray-800/30 p-4">
            <p className="text-blue-300 mb-2">OFERTA TERMINA EM:</p>
            <div className="flex gap-2 justify-center">
              <div className="bg-blue-900/50 rounded-full p-3 min-w-[60px]">
                <div className="text-2xl font-mono">{timeLeft.days}</div>
                <div className="text-xs text-blue-200">DIAS</div>
              </div>
              <div className="bg-blue-900/50 rounded-full p-3 min-w-[60px]">
                <div className="text-2xl font-mono">{timeLeft.hours}</div>
                <div className="text-xs text-blue-200">HORAS</div>
              </div>
              <div className="bg-blue-900/50 rounded-full p-3 min-w-[60px]">
                <div className="text-2xl font-mono">{timeLeft.minutes}</div>
                <div className="text-xs text-blue-200">MIN</div>
              </div>
              <div className="bg-blue-900/50 rounded-full p-3 min-w-[60px]">
                <div className="text-2xl font-mono">{timeLeft.seconds}</div>
                <div className="text-xs text-blue-200">SEG</div>
              </div>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20">
            Comprar Agora
          </button>
        </div>
      </div>

      {/* Estilos CSS personalizados para as animações */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes slideInFromBottom {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideInFromBottom {
          animation: slideInFromBottom 1s ease-out forwards; /* 'forwards' mantém o estado final da animação */
        }
      `}</style>
    </div>
  );
};

export default ProductDisplayWithHalo;
