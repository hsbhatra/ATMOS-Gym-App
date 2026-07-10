export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  EXPIRY_SECONDS: 10 * 60,
  EXPIRY_MS: 10 * 60 * 1000,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
  PURPOSES: {
    REGISTRATION: "registration",
    FORGOT_PASSWORD: "forgotPassword",
  },
};

export const SESSION_CONFIG = {
  MAX_ACTIVE_DEVICES: 2,
  EXPIRY_DAYS: 30,
  EXPIRY_MS: 30 * 24 * 60 * 60 * 1000,
  EXPIRY_SECONDS: 30 * 24 * 60 * 60,
};

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "30d",
  ALGORITHM: "HS256",
};

export const BCRYPT_CONFIG = {
  SALT_ROUNDS: 12,
};

export const TEMP_REGISTRATION_CONFIG = {
  EXPIRY_MINUTES: 15,
  EXPIRY_SECONDS: 15 * 60,
  EXPIRY_MS: 15 * 60 * 1000,
};

export const RATE_LIMIT_CONFIG = {
  OTP: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 5,
  },
  LOGIN: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 10,
  },
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 20,
  },
};

export const USER_ROLES = {
  MEMBER: "member",
  TRAINER: "trainer",
  ADMIN: "admin",
};

export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const COOKIE_CONFIG = {
  REFRESH_TOKEN: {
    NAME: "refreshToken",
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === "production",
    SAME_SITE: process.env.NODE_ENV === "production" ? "none" : "lax",
    MAX_AGE: SESSION_CONFIG.EXPIRY_MS,
  },
};

export const EMAIL_CONFIG = {
  FROM_NAME: "Hulk Gym",
  SUBJECTS: {
    REGISTRATION_OTP: "Verify Your Hulk Gym Account",
    FORGOT_PASSWORD_OTP: "Reset Your Hulk Gym Password",
  },
  OTP_VALIDITY_TEXT: `${OTP_CONFIG.EXPIRY_MINUTES} minutes`,
};
