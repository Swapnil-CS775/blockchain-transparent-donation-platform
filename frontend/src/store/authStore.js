import { create } from 'zustand';

const getStoredAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const wallet = localStorage.getItem('walletAddress');
    return { token, role, wallet };
};

const stored = getStoredAuth();

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('token') || null,
    walletAddress: stored.wallet || null,
    role: stored.role || null,
    
    setAuth: (token, role, walletAddress) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('walletAddress', walletAddress);
        set({ token, role, walletAddress });
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('walletAddress');
        set({ token: null, role: null, walletAddress: null });
    }
}));