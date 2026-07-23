// =============================================================================
// src/components/layout/AdminRoute.jsx
// =============================================================================
// Protects admin-only routes. Checks BOTH:
//   1. User is authenticated (logged in)
//   2. User's role is "admin"
//
// Non-admin logged-in users are redirected to "/" (not "/login" — they ARE
// logged in, they just don't have permission).
// =============================================================================

import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

export default function AdminRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user             = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}