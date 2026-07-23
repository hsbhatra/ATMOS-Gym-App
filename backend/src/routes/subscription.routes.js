// =============================================================================
// src/routes/subscription.routes.js
// =============================================================================

import { Router } from "express";
import authenticate from "../middleware/auth/authenticate.middleware.js";

import {
  initiate,
  verify,
  getMyHistory,
  getMyActive,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(authenticate);

router.post("/initiate",   initiate);
router.post("/verify",     verify);
router.get ("/my",         getMyHistory);
router.get ("/my/active",  getMyActive);

export default router;
