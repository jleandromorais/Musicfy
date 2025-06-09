// src/main.tsx (ou src/index.tsx)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Note a extensão .tsx se estiver usando TypeScript
import './index.css' // MUITO IMPORTANTE: Garanta que seu CSS global do Tailwind é importado aqui!
import { CartProvider } from './contexts/CartContext.tsx' // Ajuste o caminho conforme necessário;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
  
);