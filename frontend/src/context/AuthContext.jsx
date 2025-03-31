import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for stored token on app load
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode the token to get user info
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser(payload);
                
                // Check if token is expired
                if (payload.exp * 1000 <= Date.now()) {
                    handleTokenExpiration();
                }
            } catch (error) {
                // If token is invalid, clear it
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const handleTokenExpiration = () => {
        localStorage.removeItem('token');
        setUser(null);
        alert('Your session has expired. Please login again.');
        setTimeout(() => {
            navigate('/');
        }, 3000);
    };

    const login = (token) => {
        // Clear any existing token first
        localStorage.clear(); // Clear all storage
        sessionStorage.clear(); // Clear session storage too
        // Set the new token
        localStorage.setItem('token', token);
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
    };

    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        navigate('/');
    };

    const isAuthenticated = () => {
        if (!user) return false;
        // Check if token is expired
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 <= Date.now()) {
                handleTokenExpiration();
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            isAuthenticated,
            getAuthHeader 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 