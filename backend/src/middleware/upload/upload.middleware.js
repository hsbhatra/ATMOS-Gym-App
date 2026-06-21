// =============================================================================
// src/middleware/upload/upload.middleware.js
// =============================================================================

import multer from "multer";
import cloudinary from "../../config/cloudinary.js";
import ApiError from "../../utils/apiError.js";

// =============================================================================
// Multer Memory Storage
// =============================================================================
// Instead of using multer-storage-cloudinary, we store the file in memory
// temporarily (as a Buffer), then stream it to Cloudinary ourselves.
// This avoids the CommonJS/ESM compatibility issue entirely.
// =============================================================================

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        "Invalid file type. Only JPG, PNG, and WebP images are allowed.",
      ),
      false,
    );
  }
};

const multerUpload = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("profilePicture");

// =============================================================================
// uploadToCloudinary
// =============================================================================
// Takes the file buffer from multer memory storage and streams it to
// Cloudinary using upload_stream. Returns the Cloudinary result object
// which contains the secure URL and public_id.
// =============================================================================

const uploadToCloudinary = (fileBuffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "hulk-gym/profile-pictures",
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
          },
        ],
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    uploadStream.end(fileBuffer);
  });
};

// =============================================================================
// uploadProfilePictureMiddleware
// =============================================================================
// 1. Multer receives the file → stores in memory as Buffer
// 2. We stream the Buffer to Cloudinary
// 3. Attach Cloudinary result to req.cloudinaryResult for the controller
// =============================================================================

export const uploadProfilePictureMiddleware = async (req, res, next) => {
  // Step 1: Run multer to get file into memory
  multerUpload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          ApiError.badRequest("File too large. Maximum size is 5MB."),
        );
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          ApiError.badRequest("Use 'profilePicture' as the field name."),
        );
      }
      if (err instanceof ApiError) return next(err);
      return next(ApiError.badRequest("File upload failed. Please try again."));
    }

    // No file was sent
    if (!req.file) {
      return next(ApiError.badRequest("No image file provided."));
    }

    // Step 2: Upload buffer to Cloudinary
    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype,
      );
      // Attach result to request so controller can use it
      req.cloudinaryResult = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      next();
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return next(
        ApiError.internal("Failed to upload image. Please try again."),
      );
    }
  });
};
