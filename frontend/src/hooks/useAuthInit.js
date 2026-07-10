// =============================================================================
// src/hooks/useAuthInit.js
// =============================================================================
// Runs once on app startup. Tries to restore the user's session
// by calling /refresh-token using the HTTP-only cookie.
// If successful → user stays logged in after refresh.
// If fails → user is treated as logged out (cookie expired/missing).
// =============================================================================

import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const useAuthInit = () => {
  const { setAuth, setInitialized, isInitialized } = useAuthStore();

  useEffect(() => {
    // Only run once
    if (isInitialized) return;

    const restoreSession = async () => {
      try {
        // Try to get a new access token using the refresh token cookie
        // This call sends the HTTP-only cookie automatically
        const tokenRes = await axios.get(`${BASE_URL}/auth/refresh-token`, {
          withCredentials: true,
        });

        const newAccessToken = tokenRes.data.data.accessToken;

        // Now get the user's profile using the new token
        const profileRes = await axios.get(`${BASE_URL}/profile`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${newAccessToken}` },
        });

        const user = profileRes.data.data.user;

        // Restore auth state — user stays logged in
        setAuth(user, newAccessToken);
      } catch {
        // No valid session — treat as logged out
        // This is normal when user has never logged in or session expired
        setInitialized();
      }
    };

    restoreSession();
  }, []);
};