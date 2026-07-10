// =============================================================================
// src/app.js
// =============================================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import authRouter from "./routes/auth/index.js";
import profileRouter from "./routes/profile.routes.js";
import errorHandler from "./middleware/error/errorHandler.middleware.js";

const app = express();

// -----------------------------------------------------------------------------
// Security Middleware
// -----------------------------------------------------------------------------

// helmet: automatically sets secure HTTP response headers
// e.g. prevents clickjacking, sniffing attacks, etc. — zero config needed
app.use(helmet());

// cors: allows your frontend (different port/domain) to call this API
app.use(
  cors({
    origin: (origin, callback) => {
      // Normalize both the allowed client URL and incoming origin by removing trailing slashes
      const allowedOrigin = process.env.CLIENT_URL?.replace(/\/$/, "") || "http://localhost:5173";
      const normalizedOrigin = origin?.replace(/\/$/, "");
      
      if (!origin || normalizedOrigin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // required to send/receive cookies cross-origin
  }),
);

// Manual sanitizer — strips MongoDB operators from req.body only
// Avoids express-mongo-sanitize conflict with Express's read-only req.query
app.use((req, res, next) => {
  if (req.body) {
    const sanitize = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith("$")) {
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      });
    };
    sanitize(req.body);
  }
  next();
});

// -----------------------------------------------------------------------------
// Body & Cookie Parsing
// -----------------------------------------------------------------------------

// Parses incoming JSON request bodies → available as req.body
app.use(express.json({ limit: "10kb" })); // limit prevents large payload attacks

// Parses URL-encoded form data → available as req.body
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Parses cookies from incoming requests → available as req.cookies
// Required for reading the refresh token HTTP-only cookie
app.use(cookieParser());

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);

// Health check (existing)
app.use("/api/health", healthRoutes);

// -----------------------------------------------------------------------------
// 404 Handler — unknown routes
// -----------------------------------------------------------------------------
// If a request doesn't match any route above, send a clean 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    errors: [],
  });
});

// -----------------------------------------------------------------------------
// Global Error Handler — MUST be last
// -----------------------------------------------------------------------------
// Express identifies this as an error handler because it has 4 parameters.
// All errors from controllers, services, and middleware end up here.
app.use(errorHandler);

export default app;
