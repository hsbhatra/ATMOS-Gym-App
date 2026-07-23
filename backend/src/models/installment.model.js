// =============================================================================
// src/models/installment.model.js
// =============================================================================

import mongoose from "mongoose";
import { INSTALLMENT_STATUS, PAYMENT_MODE } from "../utils/constants.js";

const installmentSchema = new mongoose.Schema(
  {
    paymentId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "Payment",
      required: [true, "paymentId is required"],
      index   : true,
    },

    subscriptionId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "Subscription",
      required: [true, "subscriptionId is required"],
    },

    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "User",
      required: [true, "userId is required"],
      index   : true,
    },

    installmentNumber: {
      type    : Number,
      required: [true, "installmentNumber is required"],
      min     : [1, "Installment number must be at least 1"],
      // 1 = first installment, 2 = second, etc.
    },

    // Amount expected for this installment (in paise)
    amountDue: {
      type    : Number,
      required: [true, "amountDue is required"],
      min     : [0],
    },

    // Amount actually received for this installment (in paise)
    amountPaid: {
      type   : Number,
      default: 0,
      min    : [0],
    },

    dueDate: {
      type    : Date,
      required: [true, "dueDate is required"],
      // Date by which this installment should be paid
    },

    paidAt: {
      type   : Date,
      default: null,
    },

    status: {
      type   : String,
      enum   : Object.values(INSTALLMENT_STATUS),
      default: INSTALLMENT_STATUS.PENDING,
    },

    paymentMode: {
      type   : String,
      enum   : Object.values(PAYMENT_MODE),
      default: null,
      // Set when admin marks this installment as paid
    },

    // Admin who marked this installment as paid
    recordedBy: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : "User",
      default: null,
    },

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

// Cron job query: find all pending installments that are now overdue
installmentSchema.index({ status: 1, dueDate: 1 });

// Admin view: all installments for a specific payment
installmentSchema.index({ paymentId: 1, installmentNumber: 1 });

const Installment = mongoose.model("Installment", installmentSchema);

export default Installment;
