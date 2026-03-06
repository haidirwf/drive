import { create } from 'zustand';

interface AuthState {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: localStorage.getItem('drivex_token'),
    login: (token: string) => {
        localStorage.setItem('drivex_token', token);
        set({ token });
    },
    logout: () => {
        localStorage.removeItem('drivex_token');
        set({ token: null });
    },
    isAuthenticated: () => {
        return !!get().token;
    },
}));
