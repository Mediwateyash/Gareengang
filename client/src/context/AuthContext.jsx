import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showWelcomeToast, setShowWelcomeToast] = useState(false);

    // Default to 'login', can be 'register'
    const [authModalTab, setAuthModalTab] = useState('login');

    useEffect(() => {
        // Load user from localStorage on initial render
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse stored user", err);
            }
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const showAuthModal = (tab = 'login') => {
        setAuthModalTab(tab);
        setIsAuthModalOpen(true);
    };

    const hideAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthModalOpen,
            authModalTab,
            setAuthModalTab,
            showAuthModal,
            hideAuthModal,
            showWelcomeToast,
            setShowWelcomeToast
        }}>
            {children}
        </AuthContext.Provider>
    );
};
