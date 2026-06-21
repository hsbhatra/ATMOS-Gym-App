import { Router } from "express";
import authenticate from "../../middleware/auth/authenticate.middleware.js";
import sessionGuard from "../../middleware/auth/sessionGuard.middleware.js";
import {
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from "../../middleware/validation/password.validation.js";
import {
  validateVerifyOtp,
  validateResendOtp,
} from "../../middleware/validation/auth.validation.js";
import {
  forgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
  resetPassword,
  changePassword,
} from "../../controllers/auth/password.controller.js";

const router = Router();

router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verify-forgot-otp", validateVerifyOtp, verifyForgotPasswordOtp);
router.post("/resend-forgot-otp", validateResendOtp, resendForgotPasswordOtp);
router.post("/reset-password", validateResetPassword, resetPassword);

router.post("/change-password", authenticate, sessionGuard, validateChangePassword, changePassword);

export default router;
