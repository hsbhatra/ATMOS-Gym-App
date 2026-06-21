class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message);
  }

  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static unprocessable(message, errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = "Too many requests. Please try again later.") {
    return new ApiError(429, message);
  }

  static internal(message = "Something went wrong. Please try again later.") {
    const error = new ApiError(500, message);
    error.isOperational = false;
    return error;
  }
}

export default ApiError;
