import Navbar from "../components/NavbarE";
import HeroSection from "../components/Hero";

const PagP = () => {
    return (
        // REMOVIDO "flex flex-col" para permitir a sobreposição.
        <div className="min-h-screen bg-gray-900"> {/* Cor de fundo para o restante da página */}
            <Navbar />
            <HeroSection />
            {/* Outros componentes podem ser adicionados aqui */}
        </div>
    );
}

export default PagP;