import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const BenefitsSection = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      offset: 120,
      duration: 800,
    });
  }, []);

  const benefits = [
    {
      title: "Entrega Grátis",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
    {
      title: "Produtos Verificados",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Devolução Fácil",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Melhor Preço Garantido",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div 
      className="benefits-gradient rounded-[2rem] p-8 text-white overflow-hidden"
      data-aos="fade-up"
    >
      <h3 
        className="text-2xl font-bold text-center mb-8"
        data-aos="fade-right"
        data-aos-delay="100"
      >
        Por que comprar diretamente da Musify?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        {benefits.map((benefit, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center bg-white/10 rounded-3xl p-6 backdrop-blur-sm
              transition-all duration-300 ease-in-out
              hover:bg-white/20 hover:shadow-lg hover:shadow-[#F14A16]/20
              hover:-translate-y-2 hover:scale-105
              group" // Adicionado group para animar elementos filhos
            data-aos="fade-right"
            data-aos-delay={150 * (index + 1)}
            data-aos-anchor-placement="top-bottom"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white/20 rounded-full p-3
              transition-all duration-300
              group-hover:bg-white/30 group-hover:rotate-6 group-hover:scale-110">
              {benefit.icon}
            </div>
            <p className="font-medium 
              transition-all duration-300
              group-hover:text-[#F14A16] group-hover:font-bold">
              {benefit.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsSection;