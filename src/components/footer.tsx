// src/components/Footer.tsx

import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-black text-white pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Coluna do Logo e Sobre */}
          <div className="md:col-span-1">
            <div 
              className="flex items-center cursor-pointer mb-4"
              onClick={() => navigate('/')}
            >
              <img src="/Logo.svg" alt="Musify Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-orange-500 font-bold text-xl tracking-wider leading-none">MUSIFY</h1>
                <p className="text-orange-300 text-xs -mt-1 leading-none">DIVE IN BEATS</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Mergulhe no mundo da música com a melhor experiência em áudio.
            </p>
          </div>

          {/* Coluna de Links de Navegação */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li><a onClick={() => navigate('/')} className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer">Home</a></li>
              <li><a onClick={() => navigate('/explore')} className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer">Explore</a></li>
              <li><a onClick={() => navigate('/orders')} className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer">Meus Pedidos</a></li>
              <li><a onClick={() => navigate('/cart')} className="text-gray-400 hover:text-orange-400 transition-colors cursor-pointer">Carrinho</a></li>
            </ul>
          </div>

          {/* Coluna de Contato */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Contato</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: contato@musicfy.com</li>
              <li>Telefone: (81) 99999-0000</li>
              <li>Endereço: Rua da Música, 123, Recife, PE</li>
            </ul>
          </div>

          {/* Coluna de Redes Sociais */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Siga-nos</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                <FaFacebook size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                <FaTwitter size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Musicfy. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;