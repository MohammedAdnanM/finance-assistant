import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, removeToken } from '@/services/api';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
    signIn: (email: string, pass: string) => Promise<boolean>;
    signUp: (email: string, pass: string) => Promise<boolean>;
    signOut: () => void;
    user: any | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check if user is logged in on mount
    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const res = await api.get('/api/user');
            if (res && res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (e) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    const signIn = async (email: string, pass: string) => {
        try {
            const res = await api.post('/login', { email, password: pass });
            if (res && res.ok) {
                const data = await res.json();
                await setToken(data.access_token);

                // Fetch user details immediately
                await checkUser();
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    const signUp = async (email: string, pass: string) => {
        try {
            const res = await api.post('/register', { email, password: pass });
            if (res && res.ok) {
                // Auto login after register functionality could be added here
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    const signOut = async () => {
        await removeToken();
        setUser(null);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider value={{ signIn, signUp, signOut, user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
