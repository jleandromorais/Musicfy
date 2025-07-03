// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PagP from './Pages/pagPrincipal';
import AuthPage from './Pages/Login';
import Products from './components/Product';
import Cart from './Pages/Cart';
import CheckoutPage from './Pages/CheckoutPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeliveryDetailsPage from './Pages/Endereco';
import SuccessPage from './Pages/SuccessPage';
import OrdersPage from './Pages/Pedidos'; // 1. Importe a página de pedidos

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PagP />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/delivery" element={<DeliveryDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/orders" element={<OrdersPage />} /> {/* 2. Adicione a rota de pedidos */}
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
}

export default App;