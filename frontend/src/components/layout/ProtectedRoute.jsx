// =============================================================================
// src/components/layout/ProtectedRoute.jsx
// =============================================================================

import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

// Wraps pages that require login
// If not authenticated → redirect to /login
export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Wraps pages that should NOT be accessible when logged in
// (login, register) — if already authenticated → redirect to home
export const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};
