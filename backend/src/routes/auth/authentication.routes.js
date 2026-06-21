import { Router } from "express";
import authenticate from "../../middleware/auth/authenticate.middleware.js";
import sessionGuard from "../../middleware/auth/sessionGuard.middleware.js";
import {
  validateRegister,
  validateVerifyOtp,
  validateResendOtp,
  validateLogin,
} from "../../middleware/validation/auth.validation.js";
import {
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  getSessions,
} from "../../controllers/auth/authentication.controller.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/verify-registration-otp", validateVerifyOtp, verifyRegistrationOtp);
router.post("/resend-registration-otp", validateResendOtp, resendRegistrationOtp);
router.post("/login", validateLogin, login);
router.get("/refresh-token", refreshToken);

router.post("/logout", authenticate, sessionGuard, logout);
router.post("/logout-all", authenticate, sessionGuard, logoutAllDevices);
router.get("/sessions", authenticate, getSessions);

export default router;
