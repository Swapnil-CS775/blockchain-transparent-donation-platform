import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    walletAddress: null,
    role: null,
    
    setAuth: (token, role, walletAddress) => {
        localStorage.setItem('token', token);
        set({ token, role, walletAddress });
    },
    
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, role: null, walletAddress: null });
    }
}));