import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WishlistProvider } from '../contexts/WishlistContext';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <WishlistProvider>{children}</WishlistProvider>;
}
