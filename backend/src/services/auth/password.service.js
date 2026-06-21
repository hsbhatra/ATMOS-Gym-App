import bcrypt from "bcryptjs";
import { BCRYPT_CONFIG } from "../../utils/constants.js";
import ApiError from "../../utils/apiError.js";

export const hashPassword = async (rawPassword) => {
  return await bcrypt.hash(rawPassword, BCRYPT_CONFIG.SALT_ROUNDS);
};

export const comparePassword = async (rawPassword, hashedPassword) => {
  return await bcrypt.compare(rawPassword, hashedPassword);
};

export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&* etc.)",
    );
  }

  if (/\s/.test(password)) {
    errors.push("Password cannot contain spaces");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest("Password does not meet requirements", errors);
  }

  return { isValid: true };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw ApiError.badRequest("Passwords do not match");
  }
  return true;
};
