import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Ajuste o caminho

const Navbar = () => {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAuthAction = () => {
        if (currentUser) {
            logout();
        } else {
            navigate('/login');
        }
    };

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-roxo-profundo shadow-lg' : 'bg-transparent'}`}>
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

                {/* Menu de Navegação */}
                <nav className="hidden md:flex gap-8">
                    <button 
                        onClick={() => navigate('/')} 
                        className="text-white font-medium hover:text-orange-400"
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => navigate('/explore')}
                        className="text-white font-medium hover:text-orange-400"
                    >
                        Explore
                    </button>
                    <button 
                        onClick={() => navigate('/contact')}
                        className="text-white font-medium hover:text-orange-400"
                    >
                        Contact Us
                    </button>
                </nav>

                {/* Ícones e Botão de Login/Logout */}
                <div className="hidden md:flex items-center gap-8">
                    <button 
                        className="text-white hover:text-orange-400"
                        onClick={() => navigate('/search')}
                    >
                        <FontAwesomeIcon icon={faSearch} size="lg" />
                    </button>
                    <button 
                        className="text-white hover:text-orange-400"
                        onClick={() => navigate('/cart')}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                    </button>
                    <button 
                        onClick={handleAuthAction}
                        className={`flex items-center gap-2 px-5 py-1.5 rounded-md font-medium transition-colors ${
                            currentUser 
                                ? 'bg-orange-400 text-white hover:bg-orange-500'
                                : 'bg-transparent text-orange-400 border border-orange-400 hover:bg-orange-400 hover:text-white'
                        }`}
                    >
                        {currentUser ? (
                            <>
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                Sair
                            </>
                        ) : 'Login'}
                    </button>
                    
                    {/* Mostra a foto do usuário se estiver logado */}
                    {currentUser?.photoURL && (
                        <img 
                            src={currentUser.photoURL} 
                            alt="User" 
                            className="w-8 h-8 rounded-full cursor-pointer"
                            onClick={() => navigate('/profile')}
                        />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;