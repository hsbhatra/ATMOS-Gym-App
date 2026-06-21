import Joi from "joi";
import ApiError from "../../utils/apiError.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(ApiError.badRequest("Validation failed", messages));
  }

  next();
};

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().required()
    .messages({
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required",
    }),

  lastName: Joi.string().min(2).max(50).trim().required()
    .messages({
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required",
    }),

  email: Joi.string().email().lowercase().trim().required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required()
    .messages({
      "string.pattern.base": "Please provide a valid 10-digit Indian mobile number",
      "any.required": "Phone number is required",
    }),

  password: Joi.string().min(8).max(128).required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Please confirm your password",
    }),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  otp: Joi.string().length(6).pattern(/^\d{6}$/).required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required",
    }),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string().required()
    .messages({
      "any.required": "Password is required",
    }),
});

// --- Update Profile ---
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim()
    .messages({
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
    }),

  lastName: Joi.string().min(2).max(50).trim()
    .messages({
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
    }),

  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/)
    .messages({
      "string.pattern.base": "Please provide a valid 10-digit Indian mobile number",
    }),
});

export const validateRegister = validate(registerSchema);
export const validateVerifyOtp = validate(verifyOtpSchema);
export const validateResendOtp = validate(resendOtpSchema);
export const validateLogin = validate(loginSchema);
export const validateUpdateProfile = validate(updateProfileSchema);
