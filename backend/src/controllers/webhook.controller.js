// =============================================================================
// src/controllers/webhook.controller.js
// =============================================================================

import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import Payment from "../models/payment.model.js";
import Subscription from "../models/subscription.model.js";
import { sendPaymentReceipt } from "../services/email/paymentEmail.service.js";
import { SUBSCRIPTION_STATUS, PAYMENT_STATUS } from "../utils/constants.js";

// =============================================================================
// razorpayWebhook
// POST /api/v1/webhooks/razorpay
// =============================================================================
// Receives server-to-server payment confirmation from Razorpay.
// This is the SOURCE OF TRUTH for payment activation — cannot be faked
// because we verify the signature using our webhook secret.
//
// IMPORTANT: This route must receive the RAW request body (not parsed JSON)
// for signature verification to work. See app.js for the special raw body
// middleware applied only to this route.
// =============================================================================

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.headers["x-razorpay-signature"];
  const webhookSecret    = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Verify this request genuinely came from Razorpay
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body) // raw buffer, not parsed JSON
    .digest("hex");

  if (expectedSignature !== webhookSignature) {
    console.error("Webhook signature mismatch — possible spoofed request");
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  // Signature confirmed genuine — now safe to parse the body
  const event = JSON.parse(req.body.toString());
  console.log("Razorpay webhook received:", event.event);

  // ── payment.captured / order.paid — activate the subscription ──────────────
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const paymentEntity = event.payload.payment.entity;
    const orderId        = paymentEntity.order_id;
    const paymentId       = paymentEntity.id;

    const payment = await Payment.findOne({ "razorpay.orderId": orderId });

    // Idempotent — skip if already processed (avoids double-processing when
    // both the frontend verify call AND this webhook fire close together)
    if (payment && payment.status !== PAYMENT_STATUS.COMPLETED) {
      payment.status              = PAYMENT_STATUS.COMPLETED;
      payment.amountPaid          = payment.amountDue;
      payment.razorpay.paymentId  = paymentId;
      payment.razorpay.method     = paymentEntity.method;
      payment.paidAt              = new Date();
      await payment.save();

      const subscription = await Subscription.findById(payment.subscriptionId).populate("userId");

      if (subscription && subscription.status !== SUBSCRIPTION_STATUS.ACTIVE) {
        subscription.status      = SUBSCRIPTION_STATUS.ACTIVE;
        subscription.activatedAt = new Date();
        await subscription.save();

        try {
          await sendPaymentReceipt(subscription.userId, subscription, payment);
        } catch (err) {
          console.error("Webhook email send failed:", err.message);
        }
      }
    }
  }

  // ── payment.failed — mark as failed ─────────────────────────────────────────
  if (event.event === "payment.failed") {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    const payment = await Payment.findOne({ "razorpay.orderId": orderId });
    if (payment && payment.status === PAYMENT_STATUS.PENDING) {
      payment.status = PAYMENT_STATUS.FAILED;
      await payment.save();
    }
  }

  // Always respond 200 quickly — acknowledges receipt to Razorpay
  return res.status(200).json({ success: true });
});
