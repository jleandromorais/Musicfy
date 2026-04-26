import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PagP from './Pages/pagPrincipal';
import AuthPage from './Pages/Login';
import Register from './Pages/Register';
import Products from './components/Product';
import Cart from './Pages/Cart';
import CheckoutPage from './Pages/CheckoutPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeliveryDetailsPage from './Pages/Endereco';
import SuccessPage from './Pages/SuccessPage';
import OrdersPage from './Pages/Pedidos';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './Pages/Admin/AdminLogin';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ProductForm from './Pages/Admin/ProductForm';
import AdminOrders from './Pages/Admin/AdminOrders';
import AdminUsers from './Pages/Admin/AdminUsers';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<PagP />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/success" element={<SuccessPage />} />

          {/* Rotas protegidas — exigem autenticação do usuário */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/delivery" element={<DeliveryDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>

          {/* Rotas admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id/edit" element={<ProductForm />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
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
    </AdminAuthProvider>
  );
}

export default App;
