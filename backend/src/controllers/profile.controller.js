// =============================================================================
// src/controllers/profile.controller.js
// =============================================================================

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../utils/constants.js";

import {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteProfilePicture,
} from "../services/profile.service.js";

// =============================================================================
// getMyProfile
// GET /api/v1/profile
// Protected: authenticate
// =============================================================================

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user.userId);

  return new ApiResponse(HTTP_STATUS.OK, "Profile retrieved successfully.", {
    user: user.toJSON(),
  }).send(res);
});

// =============================================================================
// updateMyProfile
// PATCH /api/v1/profile
// Protected: authenticate
// =============================================================================

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user.userId, req.body);

  return new ApiResponse(HTTP_STATUS.OK, "Profile updated successfully.", {
    user: user.toJSON(),
  }).send(res);
});

// =============================================================================
// updateMyProfilePicture
// PATCH /api/v1/profile/picture
// Protected: authenticate + uploadProfilePictureMiddleware
// =============================================================================

export const updateMyProfilePicture = asyncHandler(async (req, res) => {
  const newImageUrl = req.cloudinaryResult.url;
  const newPublicId = req.cloudinaryResult.publicId;

  const user = await updateProfilePicture(
    req.user.userId,
    newImageUrl,
    newPublicId,
  );

  return new ApiResponse(
    HTTP_STATUS.OK,
    "Profile picture updated successfully.",
    {
      user: user.toJSON(),
      profilePicture: newImageUrl,
    },
  ).send(res);
});

// =============================================================================
// deleteMyProfilePicture
// DELETE /api/v1/profile/picture
// Protected: authenticate
// =============================================================================

export const deleteMyProfilePicture = asyncHandler(async (req, res) => {
  const user = await deleteProfilePicture(req.user.userId);

  return new ApiResponse(
    HTTP_STATUS.OK,
    "Profile picture removed successfully.",
    { user: user.toJSON() },
  ).send(res);
});
