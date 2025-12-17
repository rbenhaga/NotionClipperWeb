import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    avatar?: string; // Alias for avatar_url for convenience
    notion_workspace_name?: string;
    subscription_status?: string;
}

interface AuthContextType {
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const currentUser = await authService.getCurrentUser();
                    if (currentUser && currentUser.user) {
                        // Also fetch full profile to get avatar
                        const profile = await authService.getUserProfile();
                        setUser({
                            id: currentUser.user.id,
                            name: profile?.full_name || currentUser.profile?.full_name || currentUser.user.email.split('@')[0],
                            email: currentUser.user.email,
                            avatar_url: profile?.avatar_url,
                            avatar: profile?.avatar_url, // Alias
                        });
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async () => {
        // This is just a placeholder - actual login happens in AuthPage
        // We'll redirect to auth page
        window.location.href = '/auth';
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.signOut();
            setUser(null);
            localStorage.removeItem('token');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
