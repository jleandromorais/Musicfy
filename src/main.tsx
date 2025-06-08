// src/main.tsx (ou src/index.tsx)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Note a extensão .tsx se estiver usando TypeScript
import './index.css' // MUITO IMPORTANTE: Garanta que seu CSS global do Tailwind é importado aqui!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)