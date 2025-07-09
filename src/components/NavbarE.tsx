import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSignOutAlt, faUser, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const navigate = useNavigate();
  const { currentUser, firebaseUser, logout } = useAuth();

  const handleAuthAction = async () => {
    if (firebaseUser) {
      await logout();
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  const getUserFirstName = () => {
    const name = firebaseUser?.displayName || currentUser?.fullName || '';
    return name.split(' ')[0];
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/50 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">

        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src="/Logo.svg"
            alt="Logo"
            className="h-20 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        {/* Navegação (visível só em telas médias ou maiores) */}
        <nav className="hidden md:flex gap-8">
          <button onClick={() => navigate('/')} className="text-white font-medium hover:text-orange-400">Home</button>
          <button onClick={() => navigate('/explore')} className="text-white font-medium hover:text-orange-400">Explore</button>
          <button onClick={() => navigate('/orders')} className="text-white font-medium hover:text-orange-400">Pedidos</button>
        </nav>

        {/* Ações (sempre visíveis) */}
        <div className="flex items-center gap-4">
          {/* Carrinho */}
          <button className="text-white hover:text-orange-400" onClick={() => navigate('/cart')} title="Carrinho">
            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
          </button>

          {/* Pedidos (visível no mobile) */}
          <button className="text-white hover:text-orange-400 md:hidden" onClick={() => navigate('/orders')} title="Pedidos">
            <FontAwesomeIcon icon={faBoxOpen} size="lg" />
          </button>

          {/* Usuário logado */}
          {firebaseUser && (
            <>
              <div className="hidden md:block text-white">Olá, {getUserFirstName()}</div>

              <div
                className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                {firebaseUser.photoURL ? (
                  <img src={firebaseUser.photoURL} alt="User" className="w-full h-full rounded-full" />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                )}
              </div>
            </>
          )}

          {/* Botão de login/logout */}
          <button
            onClick={handleAuthAction}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-colors text-sm ${
              firebaseUser
                ? 'bg-orange-400 text-white hover:bg-orange-500'
                : 'bg-transparent text-orange-400 border border-orange-400 hover:bg-orange-400 hover:text-white'
            }`}
          >
            {firebaseUser ? (
              <>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="hidden sm:inline">Sair</span>
              </>
            ) : 'Login'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
