import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    
    const navItems = [
        { href: "#Home", label: "Home" },
        { href: "#About", label: "Sobre" },
        { href: "#Portifolio", label: "Blog" },
        
    ];

    useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 20);

        const sections = navItems.map(item => {
            const section = document.querySelector(item.href);
            if (section instanceof HTMLElement) {
                return {
                    id: item.href.replace("#", ""),
                    offset: section.offsetTop - 550,
                    height: section.offsetHeight
                };
            }
            return null;
        }).filter(Boolean) as { id: string; offset: number; height: number }[];

        const currentPosition = window.scrollY;
        const active = sections.find(section =>
            currentPosition >= section.offset &&
            currentPosition < section.offset + section.height
        );

        if (active) {
            setActiveSection(active.id);
        }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
}, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

   const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const section = document.querySelector(href);
    if (section instanceof HTMLElement) {
        const top = section.offsetTop - 100;
        window.scrollTo({
            top: top,
            behavior: "smooth"
        });
    }
    setIsOpen(false);
};
    return (
    <nav
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
            isOpen
                ? "bg-[#030014] opacity-100"                     // fundo escuro opaco quando o menu está aberto
                : scrolled
                ? "bg-[#030014]/50 backdrop-blur-xl"             // fundo escuro semitransparente e com blur ao rolar
                : "bg-transparent"                               // completamente transparente no topo da página
        }`}
    >
        {/* Container da navbar (centralizado e com padding) */}
        <div className="mx-auto px-4 sm:px-6 lg:px-[10%]">
            {/* mx-auto: centraliza horizontalmente
                px-4: padding horizontal padrão
                sm:px-6: padding maior em telas ≥640px
                lg:px-[10%]: padding de 10% da largura em telas ≥1024px */}

            <div className="flex items-center justify-start h-16">
                {/* flex: organiza filhos em linha
                    items-center: alinha verticalmente ao centro
                    justify-between: espaço igual entre os extremos
                    h-16: altura de 64px */}

                {/* LOGO */}
               

                {/* MENU DESKTOP */}
                <div className="hidden md:block">
                    {/* hidden: esconde em telas pequenas
                        md:block: mostra em telas ≥768px */}
                    <div className=" flex items-center space-x-8">
                        {/* ml-8: margem à esquerda
                            flex: filhos em linha
                            items-center: alinha verticalmente
                            space-x-8: espaçamento horizontal entre os itens */}

                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href)}
                                className="group relative px-1 py-2 text-sm font-medium"
                                // group: permite aplicar efeitos em elementos filhos com group-hover
                                // relative: necessário para posicionamento do sublinhado
                                // px-1 py-2: padding
                                // text-sm: fonte pequena
                                // font-medium: peso médio da fonte
                            >
                                <span
                                    className={`relative  z-10 transition-colors duration-300 ${
                                        activeSection === item.href.substring(1)
                                            ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                                            : "text-[#e2d3fd] group-hover:text-white"
                                    }`}
                                    // z-10: garante que o texto fique acima do sublinhado
                                    // transition-colors: transição suave de cor
                                    // duration-300: duração de 300ms
                                >
                                    {item.label}
                                </span>
                                <span
                                    className={`absolute  bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] transform origin-left transition-transform duration-300 ${
                                        activeSection === item.href.substring(1)
                                            ? "scale-x-100"
                                            : "scale-x-0 group-hover:scale-x-100"
                                    }`}
                                    // absolute: posicionamento absoluto
                                    // bottom-0 left-0: fixa na base esquerda
                                    // w-full: largura total do link
                                    // h-0.5: altura de 2px (sublinhado)
                                    // transform: ativa transformação
                                    // origin-left: transforma a partir da esquerda
                                    // transition-transform: animação de escala
                                />
                            </a>
                        ))}
                    </div>
                </div>

                {/* BOTÃO HAMBÚRGUER (mobile) */}
                <div className="md:hidden">
                    {/* md:hidden: visível só em telas menores que 768px */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative p-2 text-[#e2d3fd] hover:text-white transition-transform duration-300 ease-in-out transform ${
                            isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
                        }`}
                        // p-2: padding interno
                        // text-[#e2d3fd]: cor inicial do ícone
                        // hover:text-white: cor branca no hover
                        // transition-transform: anima rotação/escala
                        // ease-in-out: suaviza a animação
                        // transform: ativa rotação/escala
                        // rotate-90 / rotate-0: gira o ícone
                        // scale-125 / scale-100: aumenta ou mantém o tamanho
                    >
                        {isOpen ? (
                            <X className="w-6 h-6" /> // ícone de fechar (24px)
                        ) : (
                            <Menu className="w-6 h-6" /> // ícone de menu (24px)
                        )}
                    </button>
                </div>
            </div>
        </div>

        {/* MENU MOBILE EXPANDIDO */}
        <div
            className={`md:hidden h-2/5 fixed inset-0 bg-[#030014] transition-all duration-300 ease-in-out ${
                isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-[-100%] pointer-events-none"
            }`}
            style={{ top: "64px" }}
            // md:hidden: visível só em telas menores
            // h-2/5: altura de 40% da tela
            // fixed: fixa na tela
            // inset-0: ocupa toda a largura/altura
            // bg-[#030014]: fundo escuro
            // transition-all: anima tudo que mudar
            // duration-300: 300ms
            // ease-in-out: suaviza a transição
            // translate-y-0: posição normal
            // translate-y-[-100%]: move para cima
            // pointer-events-none: impede clique quando fechado
        >
            <div className="flex flex-col h-full">
                {/* flex-col: empilha verticalmente
                    h-full: altura total do menu */}
                <div className="px-4 py-6 space-y-4 flex-1">
                    {/* px-4 py-6: padding interno
                        space-y-4: espaço vertical entre links
                        flex-1: ocupa espaço restante */}
                    {navItems.map((item, index) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => scrollToSection(e, item.href)}
                            className={`block px-4 py-3 text-lg font-medium transition-all duration-300 ease ${
                                activeSection === item.href.substring(1)
                                    ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                                    : "text-[#e2d3fd] hover:text-white"
                            }`}
                            style={{
                                transitionDelay: `${index * 100}ms`, // atraso de animação entre links
                                transform: isOpen ? "translateX(0)" : "translateX(50px)",
                                opacity: isOpen ? 1 : 0,
                            }}
                            // block: ocupa toda a linha
                            // px-4 py-3: espaçamento interno
                            // text-lg: fonte maior
                            // font-medium: peso da fonte
                            // transition-all: anima tudo
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </nav>
);
};

export default Navbar;