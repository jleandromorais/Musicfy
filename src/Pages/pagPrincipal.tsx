import Navbar from "../components/NavbarE";
import HeroSection from "../components/Hero";
import Products from "../components/Product";
import Banner from "../components/BannerPOrganização";
import Fone from "../components/ProdutoFone";
import AccessoriesGallery from '../components/Acessorios';
import Footer from  "../components/footer";
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const PagP = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000, // Duração da animação em milissegundos
            once: true, // Animação acontece apenas uma vez
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 overflow-x-hidden"> {/* Adicionado overflow-x-hidden para evitar barras de rolagem horizontais */}
            <Navbar />

            {/* Animação para a Hero Section */}
            <div data-aos="fade-down">
                <HeroSection />
            </div>

            {/* Animação para a seção de Produtos */}
            <div data-aos="fade-up">
                <Products/>
            </div>

            {/* Animação para o Banner */}
            <div data-aos="fade-in">
                <Banner />
            </div>

            {/* Animação para a seção do Fone */}
            <div data-aos="fade-right">
                <Fone />
            </div>

            {/* Animação para a Galeria de Acessórios */}
            <div data-aos="fade-left">
                <AccessoriesGallery />
            </div>
            
            <Footer />
        </div>
    );
}

export default PagP;