import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

// Definimos um tipo para o tema para garantir segurança de tipo
type Theme = 'light' | 'dark';

const ThemeToggleButton: React.FC = () => {
  // 1. Inicializamos o tema lendo do localStorage (se existir) ou 'dark' como padrão.
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'dark'; // Se não houver tema salvo, inicie como 'dark'
  });

  // 2. Este useEffect é executado APÓS o primeiro render e toda vez que 'theme' muda.
  // Ele é responsável por aplicar a classe de tema ao <body> do documento.
  useEffect(() => {
    console.log('useEffect: Aplicando tema ao body:', `${theme}-mode`); // Para depuração

    // Remove AMBAS as classes para garantir que não haja conflito
    document.body.classList.remove('light-mode', 'dark-mode');
    // Adiciona a nova classe baseada no tema atual
    document.body.classList.add(`${theme}-mode`);

    // 3. Opcional: Persistir o tema no localStorage a cada mudança
    localStorage.setItem('theme', theme);

  }, [theme]); // O efeito é re-executado apenas quando o estado 'theme' muda

 // Função para alternar o tema
  const handleToggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('handleToggleTheme: Alternando para o tema:', newTheme); // Para depuração
      return newTheme;
    });
  };

  // Cores dos ícones (podem vir do seu tailwind.config.js ou ser hex codes diretos)
  // Eu usei as cores definidas no seu tailwind.config.js na explicação anterior.
  const moonColor = '#FFD700'; // Cor para a lua amarela
  const circleColor = '#A0AEC0'; // Cor para o círculo cinza

  return (
    <button
      id="themeToggleButton"
      type="button"
      className="flex itemns-center gap-2
                 p-2 rounded-full
                 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                 transition-colors duration-200
                 cursor-pointer"
      onClick={handleToggleTheme}
    >
      <span className="flex items-center gap-2">
        {theme === 'dark' ? (
          // Ícone de lua para o modo escuro
          <FontAwesomeIcon icon={faMoon} className="text-xl" style={{ color: moonColor }} />
        ) : (
          // Ícone de sol para o modo claro (assumindo que o sol também é amarelo ou outra cor)
          <FontAwesomeIcon icon={faSun} className="text-xl" style={{ color: moonColor }} /> 
          // Se o "sol" é apenas o círculo cinza e a lua some:
          // {/* Renderizar nada ou um placeholder */}
        )}

        {/* O círculo cinza (da sua imagem original), que parece ser estático e representa o "outro" estado */}
        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: circleColor }}></div>
      </span>
    </button>
  );
};

export default ThemeToggleButton;