import { verifyAccessToken } from "../../services/auth/token.service.js";
import ApiError from "../../utils/apiError.js";
import asyncHandler from "../../utils/asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized(
      "Access token missing. Please log in to continue.",
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw ApiError.unauthorized(
      "Access token missing. Please log in to continue.",
    );
  }

  const decoded = verifyAccessToken(token);

  req.user = {
    userId: decoded.sub,
    role: decoded.role,
    sessionId: decoded.sessionId,
  };

  next();
});

export default authenticate;
