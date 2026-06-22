// =============================================================================
// src/store/authStore.js
// =============================================================================
// Global authentication state stored in memory (not localStorage).
// Any component in the app can read from or write to this store.
// =============================================================================

import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────────────────────

  user            : null,   // logged-in user object { _id, firstName, role... }
  accessToken     : null,   // JWT access token (15 min expiry)
  isAuthenticated : false,  // quick boolean check for protected routes

  // ── Actions ────────────────────────────────────────────────────────────────

  // Called after successful login or registration
  // Stores user data and access token in memory
  setAuth: (user, accessToken) => set({
    user,
    accessToken,
    isAuthenticated: true,
  }),

  // Called when a new access token is issued (auto-refresh)
  // Only updates the token, keeps user data intact
  setAccessToken: (accessToken) => set({ accessToken }),

  // Called when user updates their profile
  // Updates user data without touching the token
  setUser: (user) => set({ user }),

  // Called on logout — clears everything from memory
  logout: () => set({
    user            : null,
    accessToken     : null,
    isAuthenticated : false,
  }),
}));
