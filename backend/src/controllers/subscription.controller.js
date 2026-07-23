// =============================================================================
// src/controllers/subscription.controller.js
// =============================================================================

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { HTTP_STATUS } from "../utils/constants.js";

import {
  initiateSubscription,
  verifyAndActivateSubscription,
  getMySubscriptionHistory,
  getMyActiveSubscription,
} from "../services/subscription.service.js";

// =============================================================================
// initiate
// POST /api/v1/subscriptions/initiate
// Protected: authenticate
// =============================================================================

export const initiate = asyncHandler(async (req, res) => {
  const { planId, durationDays } = req.body;

  if (!planId || !durationDays) {
    throw ApiError.badRequest("planId and durationDays are required.");
  }

  const orderDetails = await initiateSubscription(
    req.user.userId,
    planId,
    Number(durationDays),
  );

  return new ApiResponse(
    HTTP_STATUS.OK,
    "Order created. Proceed to payment.",
    orderDetails,
  ).send(res);
});

// =============================================================================
// verify
// POST /api/v1/subscriptions/verify
// Protected: authenticate
// =============================================================================
// Called by frontend immediately after Razorpay checkout success.
// This is a backup/UX path — the webhook is the source of truth.
// =============================================================================

export const verify = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw ApiError.badRequest("Missing payment verification details.");
  }

  const { subscription, payment } = await verifyAndActivateSubscription(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  );

  return new ApiResponse(
    HTTP_STATUS.OK,
    "Payment verified. Membership activated!",
    {
      subscription,
      receiptNumber: payment.receiptNumber,
    },
  ).send(res);
});

// =============================================================================
// getMyHistory
// GET /api/v1/subscriptions/my
// Protected: authenticate
// =============================================================================

export const getMyHistory = asyncHandler(async (req, res) => {
  const subscriptions = await getMySubscriptionHistory(req.user.userId);

  return new ApiResponse(HTTP_STATUS.OK, "Subscription history retrieved.", { subscriptions, }).send(res);
});

// =============================================================================
// getMyActive
// GET /api/v1/subscriptions/my/active
// Protected: authenticate
// =============================================================================

export const getMyActive = asyncHandler(async (req, res) => {
  const result = await getMyActiveSubscription(req.user.userId);

  return new ApiResponse(
    HTTP_STATUS.OK,
    result ? "Active subscription found." : "No active subscription.",
    result
      ? {
          subscription: result.subscription,
          payment: result.payment,
          installments: result.installments,
        }
      : { subscription: null, payment: null, installments: [] },
  ).send(res);
});
