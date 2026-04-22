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
import OrdersPage from './Pages/Pedidos';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<PagP />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/success" element={<SuccessPage />} />

        {/* Rotas protegidas — exigem autenticação */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/delivery" element={<DeliveryDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
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
