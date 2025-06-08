import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PagP from './Pages/pagPrincipal';
import AuthPage from './Pages/Login';
import Products from './components/Product'; // Note o "P" maiúsculo

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PagP />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </Router>
  );
}

export default App;