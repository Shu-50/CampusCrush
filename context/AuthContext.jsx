import React, { createContext, useContext, useEffect, useState } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await ApiService.getAuthToken();
            if (token) {
                const response = await ApiService.getCurrentUser();
                if (response.success) {
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                } else {
                    await ApiService.removeAuthToken();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            await ApiService.removeAuthToken();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await ApiService.login(credentials);
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await ApiService.register(userData);
            if (response.success) {
                await ApiService.setAuthToken(response.data.token);
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await ApiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};