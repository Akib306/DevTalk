import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading, logout } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // You might want to replace this with a proper loading component
    }

    if (!isAuthenticated()) {
        // If token is expired, clear it and redirect to home
        logout();
        return <Navigate to="/" replace />;
    }

    return children;
} 