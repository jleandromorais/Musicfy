import Navbar from "../components/NavbarE";
import HeroSection from "../components/Hero";
import Products from "../components/Product";

const PagP = () => {
    return (
        // REMOVIDO "flex flex-col" para permitir a sobreposição.
        <div className="min-h-screen bg-gray-900"> {/* Cor de fundo para o restante da página */}
            <Navbar />
            <HeroSection />
            {/* Outros componentes podem ser adicionados aqui */}
            <Products/>
        </div>
    );
}

export default PagP;