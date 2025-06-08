import { useState, useEffect } from 'react'; // Importe useEffect aqui
import { FiSearch, FiShoppingCart, FiMoon, FiSun } from 'react-icons/fi';
import { FaHeadphones } from 'react-icons/fa';

// Opcional: Para o menu mobile, você pode usar um ícone de hamburger/close
import { FaBars, FaTimes } from 'react-icons/fa'; 

const Navbar = () => {
  // Inicializa o tema lendo do localStorage, ou 'dark' como padrão
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    // Converte a string 'true'/'false' de volta para booleano
    return savedTheme === 'true' ? true : (savedTheme === 'false' ? false : true); // Inicia como true (dark) se não salvo
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Novo estado para o menu mobile

  // Efeito para aplicar a classe de tema ao <body>
  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = '#1A002F'; // Aplica o fundo roxo-profundo do Figma diretamente no body
      document.body.style.color = 'white'; // Cor do texto no modo escuro
    } else {
      document.body.classList.add('light-mode');
      document.body.style.backgroundColor = '#F0F0F0'; // Um fundo claro para o modo claro
      document.body.style.color = '#333333'; // Cor do texto no modo claro
    }
    localStorage.setItem('theme', String(darkMode)); // Salva a preferência do tema
  }, [darkMode]);

  // Função para alternar o tema
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Função para alternar o menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    // Ajustado bg-roxo-profundo se você tiver essa cor no tailwind.config.js
    // Se o gradiente for fixo como no Figma, mantenha o bg-gradient-to-r
    <nav className="bg-roxo-profundo px-6 py-4 relative z-50"> {/* Adicionado 'relative' e 'z-50' para o mobile menu */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0"> {/* flex-shrink-0 adicionado para o logo não encolher */}
          <img src="/Logo.svg" alt="" />
          <div>
            <h1 className="text-orange-500 font-bold text-2xl tracking-wider leading-none">MUSIFY</h1> {/* text-2xl e leading-none para texto mais junto */}
            <p className="text-orange-300 text-sm -mt-1 leading-none">DIVE IN BEATS</p> {/* text-sm para o slogan, -mt-1 para aproximar */}
          </div>
        </div>
        
        {/* Navigation Links - Escondido em mobile, flex em md+ */}
        {/* Ajustado justify-center para o menu centralizado */}
        <div className="hidden md:flex items-center space-x-8 flex-grow justify-center"> {/* flex-grow para centralizar */}
          {/* Link Home - Ajustado para ter a barra laranja */}
          <a href="#" className="text-white font-medium relative group pb-1"> {/* pb-1 para dar espaço para a barra */}
            Home
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 transform scale-x-100 transition-transform duration-300"></span> {/* scale-x-100 para já estar visível */}
          </a>
          {/* Outros links de navegação sem a barra inicial, mas com hover */}
          <a href="#" className="text-white font-medium relative group pb-1">
            Explore
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </a>
          <a href="#" className="text-white font-medium relative group pb-1">
            Contact Us
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </a>
        </div>
        
        {/* Right Side - Actions */}
        <div className="flex items-center space-x-6 flex-shrink-0"> {/* flex-shrink-0 para não encolher */}
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full flex items-center p-1 
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                       ${darkMode ? 'bg-orange-500' : 'bg-gray-400'}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="sr-only">{darkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
            {/* Ícones dentro do toggle, ajustados para se moverem */}
            <FiMoon className={`text-gray-200 text-xs absolute transition-all duration-300 ${darkMode ? 'opacity-100 left-1.5' : 'opacity-0 -left-full'}`} />
            <FiSun className={`text-yellow-300 text-xs absolute transition-all duration-300 ${darkMode ? 'opacity-0 right-full' : 'opacity-100 right-1.5'}`} />
            <div 
              className={`w-4 h-4 rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                darkMode ? "translate-x-0" : "translate-x-6"
              }`}
            ></div>
          </button>
          
          {/* Ícones de Ação - agrupados para espaçamento flexível, se precisar */}
          <div className="flex items-center space-x-4"> {/* Ajustado space-x para afastar os ícones */}
            {/* Search Icon */}
            <button 
              className="text-white hover:text-orange-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full p-1"
              aria-label="Search"
            >
              <FiSearch className="text-xl" />
            </button>
            
            {/* Cart Icon */}
            <button 
              className="text-white hover:text-orange-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full p-1"
              aria-label="Cart"
            >
              <FiShoppingCart className="text-xl" />
            </button>
          </div>
          
          {/* Login Button */}
          <button 
            className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded-md hover:bg-orange-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-roxo-profundo"
            aria-label="Login"
          >
            Login
          </button>
        </div>
        
        {/* Mobile Menu Button - Escondido em desktop, aparece em mobile */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-white absolute top-1/2 -translate-y-1/2 right-6 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded p-1 z-50"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Menu Overlay/Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-purple-800 bg-opacity-95 flex flex-col items-center py-4 space-y-4 shadow-lg">
          <a href="#" className="text-white font-medium hover:text-orange-300 transition-colors" onClick={toggleMobileMenu}>Home</a>
          <a href="#" className="text-white font-medium hover:text-orange-300 transition-colors" onClick={toggleMobileMenu}>Explore</a>
          <a href="#" className="text-white font-medium hover:text-orange-300 transition-colors" onClick={toggleMobileMenu}>Contact Us</a>
          {/* Você pode adicionar os botões de ação também aqui no menu mobile */}
          <button className="border border-orange-500 text-orange-500 px-4 py-1.5 rounded-md w-full max-w-xs text-center" onClick={toggleMobileMenu}>Login</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;