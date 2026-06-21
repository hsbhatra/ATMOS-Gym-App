import mongoose from "mongoose";
import crypto from "crypto";
import { SESSION_CONFIG } from "../utils/constants.js";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required for a session"],
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: [true, "Refresh token hash is required"],
      select: false,
    },

    deviceInfo: {
      userAgent: {
        type: String,
        default: "Unknown",
        trim: true,
      },

      ipAddress: {
        type: String,
        default: "Unknown",
        trim: true,
      },

      deviceName: {
        type: String,
        default: "Unknown Device",
        trim: true,
      },

      platform: {
        type: String,
        default: "Unknown",
        trim: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + SESSION_CONFIG.EXPIRY_MS),
    },
  },

  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete ret.refreshTokenHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1, isActive: 1 });

sessionSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

sessionSchema.statics.generateRefreshToken = function () {
  return crypto.randomBytes(64).toString("hex");
};

sessionSchema.statics.countActiveSessions = async function (userId) {
  return await this.countDocuments({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

sessionSchema.statics.getOldestActiveSession = async function (userId) {
  return await this.findOne({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: 1 });
};

sessionSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.expiresAt > now
  );
};

sessionSchema.methods.touch = async function () {
  this.lastUsedAt = new Date();
  await this.save();
};

sessionSchema.methods.revoke = async function () {
  this.isActive = false;
  await this.save();
};

const Session = mongoose.model("Session", sessionSchema);

export default Session;
