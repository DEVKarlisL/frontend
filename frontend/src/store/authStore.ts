/**
 * Zustand store for authentication
 */

import { create } from "zustand";
import { User, AuthTokens } from "@/types";
import { apiClient } from "@/services/api";
import { setTokens, clearTokens } from "@/utils/authStorage";

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isLoading: true, // Start with true to prevent premature redirects
  error: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const tokens = await apiClient.login(username, password);
      const user = await apiClient.getCurrentUser();
      set({
        tokens,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Login failed";
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  loginWithGoogle: async (googleToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.loginWithGoogle(googleToken);
      const { user, access, refresh } = response;

      const tokens = { access, refresh };
      setTokens(access, refresh);

      set({
        tokens,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Google login failed";
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.logout();
      clearTokens();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Registration failed";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const user = await apiClient.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
