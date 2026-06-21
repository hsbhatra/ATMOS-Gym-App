import ApiError from "../../utils/apiError.js";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(
        `Access denied. This area requires one of these roles: ${allowedRoles.join(", ")}.`
      ));
    }

    next();
  };
};

export default authorize;
