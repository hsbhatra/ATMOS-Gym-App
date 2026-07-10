// =============================================================================
// src/store/authStore.js
// =============================================================================

import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false, // ← NEW: has the app tried to restore session yet?

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isInitialized: true,
    }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setUser: (user) => set({ user }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true, // still initialized — just not logged in
    }),

  // Called when init completes but no session was found
  setInitialized: () => set({ isInitialized: true }),
}));
