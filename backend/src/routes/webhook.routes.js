// =============================================================================
// src/routes/webhook.routes.js
// =============================================================================

import { Router } from "express";
import { razorpayWebhook } from "../controllers/webhook.controller.js";

const router = Router();

// NOTE: raw body parsing for this route is configured in app.js
// BEFORE the global express.json() middleware runs
router.post("/razorpay", razorpayWebhook);

export default router;
