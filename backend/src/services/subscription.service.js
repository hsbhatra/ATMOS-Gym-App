// =============================================================================
// src/services/subscription.service.js
// =============================================================================

import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Subscription from "../models/subscription.model.js";
import Payment from "../models/payment.model.js";
import Installment from "../models/installment.model.js";
import MembershipPlan from "../models/membershipPlan.model.js";
import ApiError from "../utils/apiError.js";
import {
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  PAYMENT_MODE,
  GRACE_PERIOD_DAYS,
} from "../utils/constants.js";
import { sendPaymentReceipt } from "./email/paymentEmail.service.js";

// =============================================================================
// initiateSubscription
// =============================================================================
// Step 1 of online payment flow.
//
// What it does:
//   1. Validates the plan and duration exist
//   2. Checks member doesn't already have an active subscription
//      (v1 rule: no mid-cycle changes — must wait for current plan to expire)
//   3. Creates a Razorpay order (a pending bill)
//   4. Creates a Subscription record with status: "pending"
//   5. Creates a Payment record with status: "pending"
//   6. Returns order details for the frontend to open Razorpay checkout
// =============================================================================

export const initiateSubscription = async (userId, planId, durationDays) => {
  const plan = await MembershipPlan.findById(planId);
  if (!plan || plan.status !== "active") {
    throw ApiError.notFound("This membership plan is not available.");
  }

  const tier = plan.getTier(durationDays);
  if (!tier) {
    throw ApiError.badRequest("Invalid plan duration selected.");
  }

  // v1 Rule: Block purchase if member already has an active subscription
  const existingActive = await Subscription.findActiveSubscription(userId);
  if (existingActive) {
    throw ApiError.conflict(
      "You already have an active membership. Please wait until it expires to purchase a new plan."
    );
  }

  // Calculate the actual price to charge (respects offers)
  const amountInPaise = plan.getEffectivePrice(durationDays);

  // Create Razorpay order
  // Razorpay requires amount in paise, and a unique receipt reference
  const razorpayOrder = await razorpay.orders.create({
    amount  : amountInPaise,
    currency: "INR",
    receipt : `order_rcpt_${Date.now()}`,
    notes: {
      userId,
      planId: planId.toString(),
      durationDays,
    },
  });

  // Calculate subscription dates (not activated yet — just calculated for reference)
  const startDate = new Date();
  const endDate   = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  const gracePeriodEnds = new Date(endDate);
  gracePeriodEnds.setDate(gracePeriodEnds.getDate() + (plan.gracePeriodDays || GRACE_PERIOD_DAYS));

  // Create Subscription in PENDING state
  // Will be activated once payment is confirmed via webhook
  const subscription = await Subscription.create({
    userId,
    planId,
    planSnapshot: {
      planName       : plan.name,
      planSlug       : plan.slug,
      durationDays,
      durationLabel  : tier.label,
      features       : plan.features,
      price          : amountInPaise,
      gracePeriodDays: plan.gracePeriodDays || GRACE_PERIOD_DAYS,
    },
    status         : SUBSCRIPTION_STATUS.PENDING,
    paymentMode    : PAYMENT_MODE.RAZORPAY,
    startDate,
    endDate,
    gracePeriodEnds,
  });

  // Create Payment record in PENDING state
  const receiptNumber = await Payment.generateReceiptNumber();
  const payment = await Payment.create({
    userId,
    subscriptionId: subscription._id,
    planId,
    receiptNumber,
    amountDue  : amountInPaise,
    amountPaid : 0,
    status     : PAYMENT_STATUS.PENDING,
    paymentMode: PAYMENT_MODE.RAZORPAY,
    razorpay: {
      orderId: razorpayOrder.id,
    },
  });

  return {
    razorpayOrderId: razorpayOrder.id,
    amount         : amountInPaise,
    currency       : "INR",
    keyId          : process.env.RAZORPAY_KEY_ID,
    subscriptionId : subscription._id,
    paymentId      : payment._id,
    planName       : plan.name,
    durationLabel  : tier.label,
  };
};

// =============================================================================
// verifyAndActivateSubscription
// =============================================================================
// Step 2 of online payment flow — called by BOTH:
//   a) Frontend after Razorpay checkout success (immediate UX feedback)
//   b) Webhook handler (source of truth — cannot be faked)
//
// Verifies the Razorpay signature to confirm payment is genuine, then
// activates the subscription and sends the receipt email.
//
// SAFE TO CALL TWICE: if already activated, just returns current state
// (idempotent — prevents double-processing if both frontend and webhook
// call this around the same time)
// =============================================================================

export const verifyAndActivateSubscription = async (orderId, paymentId, signature) => {
  // Find our internal Payment record by the Razorpay order ID
  const payment = await Payment.findOne({ "razorpay.orderId": orderId });
  if (!payment) {
    throw ApiError.notFound("Payment record not found for this order.");
  }

  // Idempotency check — if already completed, don't process again
  if (payment.status === PAYMENT_STATUS.COMPLETED) {
    const subscription = await Subscription.findById(payment.subscriptionId);
    return { payment, subscription, alreadyProcessed: true };
  }

  // Verify signature — this proves the payment is genuine and not faked
  // Razorpay's formula: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expectedSignature !== signature) {
    payment.status = PAYMENT_STATUS.FAILED;
    await payment.save();
    throw ApiError.unauthorized("Payment verification failed. Signature mismatch.");
  }

  // Signature valid — fetch payment method used from Razorpay for our records
  let paymentMethod = "unknown";
  try {
    const razorpayPayment = await razorpay.payments.fetch(paymentId);
    paymentMethod = razorpayPayment.method; // "upi", "card", "netbanking" etc.
  } catch {
    // Non-critical — proceed even if this lookup fails
  }

  // Update Payment record
  payment.status              = PAYMENT_STATUS.COMPLETED;
  payment.amountPaid          = payment.amountDue;
  payment.razorpay.paymentId  = paymentId;
  payment.razorpay.signature  = signature;
  payment.razorpay.method     = paymentMethod;
  payment.paidAt              = new Date();
  await payment.save();

  // Activate the Subscription
  const subscription = await Subscription.findById(payment.subscriptionId).populate("userId");
  subscription.status      = SUBSCRIPTION_STATUS.ACTIVE;
  subscription.activatedAt = new Date();
  await subscription.save();

  // Send receipt email (non-blocking — don't fail the request if email fails)
  try {
    await sendPaymentReceipt(subscription.userId, subscription, payment);
  } catch (err) {
    console.error("Failed to send receipt email:", err.message);
  }

  return { payment, subscription, alreadyProcessed: false };
};

// =============================================================================
// getMySubscriptionHistory
// =============================================================================

export const getMySubscriptionHistory = async (userId) => {
  return await Subscription.find({ userId })
    .sort({ createdAt: -1 })
    .populate("planId", "name slug");
};

// =============================================================================
// getMyActiveSubscription
// =============================================================================

export const getMyActiveSubscription = async (userId) => {
  const subscription = await Subscription.findActiveSubscription(userId);
  if (!subscription) return null;

  // Fetch the payment record for this subscription
  const payment = await Payment.findOne({ subscriptionId: subscription._id });

  // Fetch installments if any
  const installments = payment
    ? await Installment.find({ paymentId: payment._id }).sort({ installmentNumber: 1 })
    : [];

  return { subscription, payment, installments };
};
