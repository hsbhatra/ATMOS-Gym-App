// =============================================================================
// src/models/subscription.model.js
// =============================================================================

import mongoose from "mongoose";
import {
  SUBSCRIPTION_STATUS,
  PAYMENT_MODE,
  GRACE_PERIOD_DAYS,
} from "../utils/constants.js";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "User",
      required: [true, "userId is required"],
      index   : true,
    },

    planId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "MembershipPlan",
      required: [true, "planId is required"],
    },

    // ==========================================================================
    // planSnapshot — CRITICAL FIELD
    // ==========================================================================
    // A frozen copy of the plan + tier details at the moment of purchase.
    // WHY: If the admin later edits a plan (changes price, features, name),
    // this member's subscription should reflect what THEY paid for, not the
    // updated plan. This is how every serious subscription system works.
    // ==========================================================================
    planSnapshot: {
      planName    : { type: String, required: true },
      planSlug    : { type: String, required: true },
      durationDays: { type: Number, required: true },
      durationLabel: { type: String, required: true }, // "Monthly", "Annual" etc.
      features    : { type: [String], required: true },
      price       : { type: Number, required: true },   // in paise — what they paid
      gracePeriodDays: { type: Number, default: GRACE_PERIOD_DAYS },
    },

    status: {
      type   : String,
      enum   : Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.PENDING,
      index  : true,
    },

    paymentMode: {
      type    : String,
      enum    : Object.values(PAYMENT_MODE),
      required: [true, "paymentMode is required"],
    },

    startDate: {
      type    : Date,
      required: [true, "startDate is required"],
    },

    endDate: {
      type    : Date,
      required: [true, "endDate is required"],
    },

    // endDate + gracePeriodDays
    // Member still gets access during grace period even after endDate
    gracePeriodEnds: {
      type    : Date,
      required: true,
    },

    activatedAt: {
      type   : Date,
      default: null,
    },

    cancelledAt: {
      type   : Date,
      default: null,
    },

    cancelReason: {
      type   : String,
      default: null,
      trim   : true,
    },

    // Auto-renewal flag — used with Razorpay subscriptions API
    autoRenew: {
      type   : Boolean,
      default: false,
    },

    // Tracks which reminder emails have been sent
    // Prevents duplicate reminder emails if cron runs multiple times
    remindersSent: {
      sevenDay: { type: Boolean, default: false },
      threeDay: { type: Boolean, default: false },
      oneDay  : { type: Boolean, default: false },
      expired : { type: Boolean, default: false },
    },

    // Admin who created this (for offline payments)
    // null for online (self-purchased by member)
    createdBy: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : "User",
      default: null,
    },

    // Admin notes for cash/offline subscriptions
    notes: {
      type   : String,
      default: null,
      trim   : true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// =============================================================================
// Indexes
// =============================================================================

// Most common query: "get active subscription for this user"
subscriptionSchema.index({ userId: 1, status: 1 });

// For cron job: find all subscriptions expiring within N days
subscriptionSchema.index({ status: 1, endDate: 1 });

// =============================================================================
// Instance Method: isCurrentlyActive()
// =============================================================================
// Returns true if the member currently has gym access.
// Access is granted during active AND grace period.
// =============================================================================

subscriptionSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return (
    (this.status === SUBSCRIPTION_STATUS.ACTIVE ||
      this.status === SUBSCRIPTION_STATUS.GRACE ||
      this.status === SUBSCRIPTION_STATUS.COMPLIMENTARY) &&
    this.gracePeriodEnds > now
  );
};

// =============================================================================
// Instance Method: getDaysRemaining()
// =============================================================================
// Returns number of days until endDate.
// Negative if already expired.
// =============================================================================

subscriptionSchema.methods.getDaysRemaining = function () {
  const now  = new Date();
  const diff = this.endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// =============================================================================
// Static Method: findActiveSubscription(userId)
// =============================================================================
// Returns the current active subscription for a user if one exists.
// Checks both ACTIVE and GRACE status.
// =============================================================================

subscriptionSchema.statics.findActiveSubscription = async function (userId) {
  const now = new Date();
  return await this.findOne({
    userId,
    status        : { $in: [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.GRACE, SUBSCRIPTION_STATUS.COMPLIMENTARY] },
    gracePeriodEnds: { $gt: now },
  }).populate("planId", "name slug");
};

// =============================================================================
// Static Method: findExpiringSubscriptions(daysFromNow)
// =============================================================================
// Used by the cron job to find subscriptions expiring in exactly N days.
// Sends reminder emails to these members.
// =============================================================================

subscriptionSchema.statics.findExpiringSubscriptions = async function (daysFromNow) {
  const now    = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + daysFromNow);

  // Find subscriptions whose endDate falls within the next 24 hours
  // relative to the target date (i.e. exactly N days from now)
  const startOfDay = new Date(target);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(target);
  endOfDay.setHours(23, 59, 59, 999);

  return await this.find({
    status : SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: startOfDay, $lte: endOfDay },
  }).populate("userId", "firstName lastName email");
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
