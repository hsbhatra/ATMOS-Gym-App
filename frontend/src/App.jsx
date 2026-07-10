// =============================================================================
// src/App.jsx
// =============================================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore.js";
import { useAuthInit } from "./hooks/useAuthInit.js";
import {
  ProtectedRoute,
  PublicRoute,
} from "./components/layout/ProtectedRoute.jsx";
import AppLoader from "./components/ui/AppLoader.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ForgotOtpPage from "./pages/auth/ForgotOtpPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import SessionsPage from "./pages/profile/SessionsPage.jsx";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage.jsx";

// =============================================================================
// AppContent — renders after session initialization completes
// =============================================================================
function AppContent() {
  // Run session restore on every app startup
  useAuthInit();

  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Show loading screen while we silently check for existing session
  // This prevents the brief flash of login page before session is restored
  if (!isInitialized) return <AppLoader />;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#e8c44a", secondary: "#0a0a0a" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
        }}
      />

      <Routes>
        {/* Public — accessible by everyone */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth — only for non-logged-in users */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PublicRoute>
              <VerifyOtpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-otp"
          element={
            <PublicRoute>
              <ForgotOtpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected — only for logged-in users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/sessions"
          element={
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// =============================================================================
// App — wraps everything in BrowserRouter
// =============================================================================
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
