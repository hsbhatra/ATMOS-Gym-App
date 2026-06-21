// =============================================================================
// src/routes/profile.routes.js
// =============================================================================

import { Router } from "express";
import authenticate from "../middleware/auth/authenticate.middleware.js";
import { uploadProfilePictureMiddleware } from "../middleware/upload/upload.middleware.js";
import { validateUpdateProfile } from "../middleware/validation/auth.validation.js";


import {
  getMyProfile,
  updateMyProfile,
  updateMyProfilePicture,
  deleteMyProfilePicture,
} from "../controllers/profile.controller.js";

const router = Router();

// All profile routes require authentication
router.use(authenticate);

router.get   ("/",        getMyProfile);
router.patch ("/",        validateUpdateProfile, updateMyProfile);
router.patch ("/picture", uploadProfilePictureMiddleware, updateMyProfilePicture);
router.delete("/picture", deleteMyProfilePicture);

export default router;
