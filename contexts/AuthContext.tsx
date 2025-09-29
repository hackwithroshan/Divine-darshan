import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import api, { loginUser, registerUser, getMe, getApiErrorMessage } from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: true; user: User } | { success: false; error?: string }>;
    // FIX: Update signup return type to be a discriminated union and include the created user on success.
    signup: (name: string, mobile: string, email: string, password: string) => Promise<{ success: true; user: User } | { success: false; error?: string }>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => ({ success: false, error: 'AuthContext not ready' }),
    // FIX: Update signup default implementation to match the new type.
    signup: async () => ({ success: false, error: 'AuthContext not ready' }),
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('divine_token');
        if (token) {
            try {
                // No need to set header here, interceptor does it.
                const response = await getMe();
                setUser(response.data.data);
            } catch (error) {
                console.error("Failed to load user session", error);
                localStorage.removeItem('divine_token');
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // FIX: Add an explicit return type to the `login` function to ensure it matches the AuthContextType interface.
    // This correctly types the return value as a discriminated union, allowing for proper type narrowing in components.
    const login = async (email: string, password: string): Promise<{ success: true; user: User } | { success: false; error?: string }> => {
        try {
            const response = await loginUser({ email, password });
            const { token, user: loggedInUser } = response.data;
            localStorage.setItem('divine_token', token);
            setUser(loggedInUser);
            return { success: true, user: loggedInUser };
        } catch (error: any) {
            return { success: false, error: getApiErrorMessage(error) };
        }
    };

    const signup = async (name: string, mobile: string, email: string, password: string): Promise<{ success: true; user: User } | { success: false; error?: string }> => {
        try {
            const response = await registerUser({ name, email, mobile, password });
            const { token, user: newUser } = response.data;
            localStorage.setItem('divine_token', token);
            setUser(newUser);
            // FIX: Return the newly created user object on success.
            return { success: true, user: newUser };
        } catch (error: any) {
            return { success: false, error: getApiErrorMessage(error) };
        }
    };

    const logout = () => {
        localStorage.removeItem('divine_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
