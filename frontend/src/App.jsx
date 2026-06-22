// =============================================================================
// src/App.jsx
// =============================================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  ProtectedRoute,
  PublicRoute,
} from "./components/layout/ProtectedRoute.jsx";

// Pages — we create these one by one in the next steps
// For now they are placeholders so the router works
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

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications — shows success/error popups */}
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
          success: {
            iconTheme: { primary: "#e8c44a", secondary: "#0a0a0a" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />

      <Routes>
        {/* Public routes — accessible by everyone */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes — only for NON logged-in users */}
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

        {/* Protected routes — only for logged-in users */}
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
    </BrowserRouter>
  );
}
