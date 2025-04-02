import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // You might want to replace this with a proper loading component
    }

    // If we have a user in state from token, allow the route even if backend verification is still in progress
    if (user) {
        return children;
    }

    // Only redirect if we definitely have no user (no token or expired token)
    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    return children;
} 