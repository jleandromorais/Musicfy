import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';// Importe Variants para tipagem explícita

interface Acessorio {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  corDeFundo: string;
}

const GaleriaDeAcessorios: React.FC = () => {
  const acessorios: Acessorio[] = [
    {
      id: 'relogio',
      titulo: 'Relógio Premium',
      descricao: 'Relógio de luxo em aço inoxidável',
      imagemUrl: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      corDeFundo: 'bg-[#5B4C41]'
    },
    {
      id: 'dispositivos-inteligentes',
      titulo: 'Dispositivos Inteligentes',
      descricao: 'Ecossistema de IoT conectado',
      imagemUrl: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      corDeFundo: 'bg-[#F1F1F1]'
    },
    {
      id: 'assistente-voz',
      titulo: 'Assistente de Voz',
      descricao: 'Caixa de som inteligente com controle por voz',
      imagemUrl: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      corDeFundo: 'bg-[#CCCCCC]'
    },
    {
      id: 'soundcore',
      titulo: 'Caixa de Som Soundcore',
      descricao: 'Experiência de áudio Bluetooth premium',
      imagemUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      corDeFundo: 'bg-[#1B1B1B]'
    }
  ];

  const aoClicarNoCartao = (idProduto: string): void => {
    console.log(`Visualizando detalhes do produto ${idProduto}`);
  };

  // --- SOLUÇÃO: Variantes explícitas e mais simples ---
  
  const cardVariantsLeft: Variants = {
    offscreen: {
      x: -300,
      opacity: 0,
    },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
  };

  const cardVariantsRight: Variants = {
    offscreen: {
      x: 300,
      opacity: 0,
    },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
  };

  return (
    <section className="bg-black py-16 px-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-28">
          Veja outros acessórios
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {acessorios.map((acessorio, index) => (
            <motion.div
              key={acessorio.id}
              className="bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/50 cursor-pointer"
              onClick={() => aoClicarNoCartao(acessorio.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && aoClicarNoCartao(acessorio.id)}
              
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.1 }}
              variants={index % 2 === 0 ? cardVariantsLeft : cardVariantsRight} // Voltamos a usar a condição aqui
            >
              <div className={`relative h-60 ${acessorio.corDeFundo}`}>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${acessorio.imagemUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-blue-500/80 text-white px-4 py-2 rounded text-sm font-medium">
                      Ver Detalhes
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-white">{acessorio.titulo}</h3>
                <p className="text-sm text-gray-400">{acessorio.descricao}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GaleriaDeAcessorios;