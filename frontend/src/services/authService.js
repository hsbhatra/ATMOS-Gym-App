// =============================================================================
// src/services/authService.js
// =============================================================================
// All authentication-related API calls.
// Components never call Axios directly — they call these functions.
// =============================================================================

import api from "./api.js";

// ── Registration ──────────────────────────────────────────────────────────────

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const verifyRegistrationOtp = (data) =>
  api.post("/auth/verify-registration-otp", data);

export const resendRegistrationOtp = (data) =>
  api.post("/auth/resend-registration-otp", data);

// ── Login / Logout ────────────────────────────────────────────────────────────

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const logoutUser = () =>
  api.post("/auth/logout");

export const logoutAllDevices = () =>
  api.post("/auth/logout-all");

// ── Token ─────────────────────────────────────────────────────────────────────

export const refreshToken = () =>
  api.get("/auth/refresh-token");

// ── Sessions ──────────────────────────────────────────────────────────────────

export const getSessions = () =>
  api.get("/auth/sessions");

// ── Password ──────────────────────────────────────────────────────────────────

export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data);

export const verifyForgotOtp = (data) =>
  api.post("/auth/verify-forgot-otp", data);

export const resendForgotOtp = (data) =>
  api.post("/auth/resend-forgot-otp", data);

export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);

export const changePassword = (data) =>
  api.post("/auth/change-password", data);
