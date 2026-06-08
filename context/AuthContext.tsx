import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
// --- BACKEND SWITCHING ---
// 1. For Browser Preview / Mock Mode: Use mockBackend
// import { mockBackend as backend } from '../services/mockBackend';

// 2. For Real Node.js Backend: Use api service
import { api as backend } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<User>;
  loginWithOtp: (email: string, otp: string) => Promise<User>;
  register: (userData: Partial<User>) => Promise<void>;
  registerWithOtp: (email: string, otp: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    // @ts-ignore - 'getCurrentUser' is specific to mockBackend, for real API we use tokens
    if (backend.getCurrentUser) {
       // @ts-ignore
       const currentUser = backend.getCurrentUser();
       if (currentUser) setUser(currentUser);
    } else {
       // Fallback directly to localStorage check to support quick page reloads
       const storedUser = localStorage.getItem('hopcare_current_user');
       if (storedUser) {
         setUser(JSON.parse(storedUser));
       }
       const token = localStorage.getItem('token');
       if(token) {
         // Optionally fetch user profile from API if using real backend
       }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<User> => {
    setLoading(true);
    try {
      const user = await backend.login(email, password, role);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (email: string, otp: string): Promise<User> => {
    setLoading(true);
    try {
      // @ts-ignore — verifyOtp exists on api but not on mockBackend
      const user = await backend.verifyOtp(email, otp);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<void> => {
    setLoading(true);
    try {
      // @ts-ignore — register now sends OTP; account not created until verifyRegisterOtp
      await backend.register(userData);
    } finally {
      setLoading(false);
    }
  };

  const registerWithOtp = async (email: string, otp: string): Promise<User> => {
    setLoading(true);
    try {
      // @ts-ignore — verifyRegisterOtp exists on api but not mockBackend
      const user = await backend.verifyRegisterOtp(email, otp);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    backend.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      // Handle difference between mock and real api signature if any
      let updatedUser;
      if (backend.updateUser) {
        updatedUser = await backend.updateUser(user.id, data);
      } else {
        updatedUser = await backend.register({...user, ...data});
      }
      // Note: Real API would have a specific update endpoint
      
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      console.error(error);
      alert('Failed to save profile: ' + (error.message || error));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOtp, register, registerWithOtp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

