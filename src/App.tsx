import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PagP from './Pages/pagPrincipal';
import AuthPage from './Pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PagP />} />
        <Route path="/login" element={<AuthPage />} />
        {/* Adicione mais rotas conforme necessário */}
      </Routes>
    </Router>
  );
}

export default App;