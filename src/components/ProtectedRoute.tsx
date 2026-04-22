import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-[#1A002F] min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Verificando autenticação..." />
      </div>
    );
  }

  if (!currentUser) {
    // Salva a rota original para redirecionar após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
