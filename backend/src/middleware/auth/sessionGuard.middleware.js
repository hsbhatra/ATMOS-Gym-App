import Session from "../../models/session.model.js";
import ApiError from "../../utils/apiError.js";
import asyncHandler from "../../utils/asyncHandler.js";

const sessionGuard = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.user;

  const session = await Session.findById(sessionId);

  if (!session || !session.isValid()) {
    throw ApiError.unauthorized(
      "Your session has expired or been revoked. Please log in again."
    );
  }

  await session.touch();
  req.session = session;

  next();
});

export default sessionGuard;
