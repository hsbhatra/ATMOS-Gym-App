// =============================================================================
// src/routes/admin.routes.js
// =============================================================================

import { Router } from "express";
import authenticate from "../middleware/auth/authenticate.middleware.js";
import authorize from "../middleware/auth/authorize.middleware.js";

import {
  searchMembers,
  getMemberProfile,
  recordOfflinePayment,
  markInstallmentPaid,
  getAllSubscriptions,
  cancelSubscription,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize("admin"));

// Members
router.get("/members", searchMembers);
router.get("/members/:id", getMemberProfile);

// Subscriptions
router.get("/subscriptions", getAllSubscriptions);
router.post("/subscriptions/offline", recordOfflinePayment);
router.patch("/subscriptions/:id/cancel", cancelSubscription);

// Installments
router.patch("/installments/:id", markInstallmentPaid);

export default router;
