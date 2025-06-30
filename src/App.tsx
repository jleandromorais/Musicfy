import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PagP from './Pages/pagPrincipal';
import AuthPage from './Pages/Login';
import Products from './components/Product';
import Cart from './Pages/Cart';
import CheckoutPage from './Pages/CheckoutPage'; // Import the new CheckoutPage
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeliveryDetailsPage from './Pages/DeliveryDetailsPage'; // Import the delivery details page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PagP />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/delivery" element={<DeliveryDetailsPage />} /> {/* Assuming this is the delivery details page */}
        <Route path="/checkout" element={<CheckoutPage />} /> {/* New route */}
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