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
                
                // Check if token is expired
                if (!payload.exp || payload.exp * 1000 <= Date.now()) {
                    handleTokenExpiration();
                } else {
                    // Set user immediately based on token to prevent flash of login screen
                    setUser(payload);
                    
                    // Verify token validity with backend asynchronously
                    verifyToken(token)
                        .then(valid => {
                            if (!valid) {
                                handleTokenExpiration();
                            }
                        })
                        .catch(error => {
                            console.error('Token verification error:', error);
                            // Only clear if it's a definite authentication error, not network issues
                            if (error.status === 401 || error.status === 403) {
                                handleTokenExpiration();
                            }
                        });
                }
            } catch (error) {
                // If token is invalid, clear it
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    // Add token verification with backend
    const verifyToken = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            // Return true on network errors to avoid logging out users unnecessarily
            // We'll rely on subsequent API calls to verify token if there's connectivity issues
            return true;
        }
    };

    const handleTokenExpiration = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Show alert for expired session
        alert('Your session has expired. Please log in again.');
        navigate('/');
    };

    const login = (token) => {
        // Clear any existing token first
        localStorage.clear(); // Clear all storage
        sessionStorage.clear(); // Clear session storage too
        // Set the new token
        localStorage.setItem('token', token);
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('User payload from token:', payload); // Debug user info
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
            if (!payload.exp || payload.exp * 1000 <= Date.now()) {
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