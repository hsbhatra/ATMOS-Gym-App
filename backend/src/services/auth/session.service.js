import Session from "../../models/session.model.js";
import { SESSION_CONFIG } from "../../utils/constants.js";
import ApiError from "../../utils/apiError.js";
import { generateAccessToken } from "./token.service.js";

export const createSession = async (userId, deviceInfo) => {
  const activeCount = await Session.countActiveSessions(userId);

  if (activeCount >= SESSION_CONFIG.MAX_ACTIVE_DEVICES) {
    const oldest = await Session.getOldestActiveSession(userId);
    if (oldest) {
      await oldest.revoke();
    }
  }

  const rawRefreshToken = Session.generateRefreshToken();
  const refreshTokenHash = Session.hashToken(rawRefreshToken);

  const session = await Session.create({
    userId,
    refreshTokenHash,
    deviceInfo,
    expiresAt: new Date(Date.now() + SESSION_CONFIG.EXPIRY_MS),
  });

  return { rawRefreshToken, session };
};

export const refreshSession = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw ApiError.unauthorized("No refresh token provided. Please log in.");
  }

  const tokenHash = Session.hashToken(rawRefreshToken);

  const session = await Session.findOne({
    refreshTokenHash: tokenHash,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).populate("userId", "role isActive isEmailVerified");

  if (!session) {
    throw ApiError.unauthorized("Session expired or invalid. Please log in again.");
  }

  if (!session.userId.isActive) {
    await session.revoke();
    throw ApiError.forbidden("Your account has been deactivated. Please contact support.");
  }

  await session.touch();

  const accessToken = generateAccessToken(
    session.userId._id.toString(),
    session.userId.role,
    session._id.toString()
  );

  return { accessToken, session };
};

export const revokeSession = async (sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    return;
  }

  await session.revoke();
};

export const revokeAllSessions = async (userId) => {
  await Session.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

export const getUserSessions = async (userId, currentSessionId) => {
  const sessions = await Session.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ lastUsedAt: -1 });

  return sessions.map((session) => ({
    ...session.toJSON(),
    isCurrent: session._id.toString() === currentSessionId,
  }));
};
