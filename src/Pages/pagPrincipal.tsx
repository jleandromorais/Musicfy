import React from 'react';
import Navbar from "../components/NavbarE";
import HeroSection from "../components/Hero";
import Products from "../components/Product";
import Banner from "../components/BannerPOrganização";
import Fone from "../components/ProdutoFone";
import AccessoriesGallery from '../components/Acessorios'; // Importe o novo componente AccessoriesGallery

const PagP = () => {
    return (
        // REMOVIDO "flex flex-col" para permitir a sobreposição.
        <div className="min-h-screen bg-gray-900"> {/* Cor de fundo para o restante da página */}
            <Navbar />
            <HeroSection />
            {/* Outros componentes podem ser adicionados aqui */}
            <Products/>
            <Banner />
            {/* Adicionando o componente de produto específico */}
            <Fone />
            {/* Substituindo ou adicionando AccessoriesGallery. Se Acessorios for diferente, adicione AccessoriesGallery abaixo dele. */}
            <AccessoriesGallery /> 
        </div>
    );
}

export default PagP;
