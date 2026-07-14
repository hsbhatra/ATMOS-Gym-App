# Technical Requirements Document (TRD)
## ATMOS Gym Web Application
**Version:** 1.0  
**Last Updated:** July 2026

---

## 1. Architecture Overview

ATMOS Gym follows a standard three-tier architecture:

```
Client (React/Vite)
        ↓ HTTPS
API Server (Node.js/Express)
        ↓
Database (MongoDB Atlas)
        ↓
External Services (Cloudinary, Gmail)
```

### Design Principles
- **Separation of concerns** — Models → Services → Controllers → Routes
- **Single responsibility** — Each file/module does one job
- **Security by default** — Passwords hashed, tokens encrypted, inputs validated
- **Constants as truth** — All magic values live in `constants.js`
- **Error standardization** — All errors flow through `ApiError` → `errorHandler`

---

## 2. Backend Technical Specifications

### 2.1 Runtime & Framework
- **Node.js** v18+ with ES Modules (`"type": "module"`)
- **Express.js** v4 — HTTP server and routing
- **dotenv** isolation — `src/config/env.js` imported first to avoid ESM hoisting issues

### 2.2 Database
- **MongoDB Atlas** — cloud-hosted MongoDB
- **Mongoose** v8 — ODM with schema validation, hooks, and TTL indexes
- **Collections:** users, otps, sessions, tempregistrations

### 2.3 Authentication Strategy

```
Registration Flow:
  Form data → TempRegistration (15 min TTL)
  OTP generated → SHA-256 hashed → saved to OTP collection
  Raw OTP → email
  User submits OTP → verified → User document created → auto-login

Login Flow:
  Email + password → bcrypt compare
  New Session created → raw refresh token in HTTP-only cookie
  Access token (JWT, 15 min) → response body
  Frontend stores access token in Zustand (memory only)

Token Refresh Flow:
  Access token expires → frontend interceptor catches 401
  Refresh token cookie sent automatically to /auth/refresh-token
  New access token issued → original request retried
  If refresh fails → logout + redirect to /login
```

### 2.4 Security Measures

| Threat | Mitigation |
|--------|------------|
| XSS token theft | Access token in JS memory, refresh token in HTTP-only cookie |
| CSRF | SameSite=Strict on refresh token cookie |
| Password brute force | bcrypt cost 12, rate limiting on login |
| OTP brute force | Max 3 attempts, auto-invalidate, 60s cooldown |
| NoSQL injection | Manual body sanitizer strips `$` operators |
| Email enumeration | Same response whether email exists or not |
| Token replay | Refresh token rotation, session revocation |
| Password exposure | `select: false` on passwordHash, stripped from toJSON |
| Weak passwords | Joi validation + password strength service |
| Mass assignment | Only whitelisted fields accepted in controllers |
| Large payloads | 10kb body size limit |
| Security headers | Helmet middleware |

### 2.5 File Upload Strategy
- **Multer** memory storage — file held in RAM as Buffer
- Buffer streamed directly to Cloudinary via `upload_stream`
- No temp files written to server disk
- Old images deleted from Cloudinary on replacement/removal
- `publicId` stored in User document for deletion reference

### 2.6 Email Service
- **Nodemailer** with Gmail SMTP
- Gmail App Password (not account password)
- Branded HTML email templates
- Sent for: registration OTP, forgot password OTP

### 2.7 API Design
- RESTful conventions
- Versioned routes: `/api/v1/`
- Consistent response envelope:
  ```json
  { "success": true, "statusCode": 200, "message": "...", "data": {} }
  { "success": false, "statusCode": 400, "message": "...", "errors": [] }
  ```

### 2.8 Middleware Stack (in order)
```
Helmet → CORS → Body Sanitizer → JSON Parser → URL Parser → Cookie Parser
→ Route Handlers
  → Rate Limiter → Input Validator → Authenticate → SessionGuard → Authorize → Controller
→ 404 Handler
→ Global Error Handler
```

---

## 3. Frontend Technical Specifications

### 3.1 Build Tool
- **Vite** v6 — dev server, HMR, production bundler
- `@tailwindcss/vite` plugin for CSS processing

### 3.2 State Management
- **Zustand** — lightweight global state
- Auth store: `{ user, accessToken, isAuthenticated, isInitialized }`
- Access token stored in memory (JS variable) — never localStorage/sessionStorage
- Session restoration via `useAuthInit` hook on every app load

### 3.3 HTTP Client
- **Axios** with custom instance
- Base URL from `VITE_API_URL` env variable
- `withCredentials: true` — sends cookies cross-origin
- Request interceptor — auto-attaches `Authorization: Bearer <token>` header
- Response interceptor — catches 401, calls refresh, retries original request
- Queue system — prevents multiple simultaneous refresh calls

### 3.4 3D Graphics
- **Three.js** — WebGL renderer, particle system, torus geometry
- `ParticleBackground` component — single source of truth
  - Particle count, size, opacity, connection distance configurable via props
  - Mouse tracking — camera follows cursor
  - Auto-cleanup on component unmount (cancelAnimationFrame, dispose)
  - Resize handler — canvas redraws on window resize

### 3.5 Animations
- **Framer Motion** — declarative animations
- `AnimatePresence` for page transitions (mode="wait")
- Scroll-triggered animations via `whileInView`
- Stagger containers for card grids
- All variants centralized in `src/utils/animations.js`
- Respects `prefers-reduced-motion` via CSS

### 3.6 Forms
- **react-hook-form** — form state, validation, error display
- Client-side validation mirrors server-side rules
- Error messages appear inline below each field
- Password strength indicator updates live

### 3.7 Routing
- **React Router v6** — client-side routing
- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `PublicRoute` — redirects authenticated users to `/`
- `useAuthInit` — runs before routes render, restores session

### 3.8 Responsive Design
- Mobile-first CSS approach
- Breakpoints: 480px, 768px, 1024px, 1280px
- CSS Grid with `auto-fit` and `minmax` for fluid layouts
- Hamburger nav on mobile (<768px)
- Profile sidebar becomes top tab bar on mobile
- Touch device improvements (min tap target 44px)

---

## 4. External Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| MongoDB Atlas | Database hosting | 512MB shared cluster |
| Cloudinary | Image storage/transformation | 25GB storage, 25 credits/month |
| Gmail SMTP | OTP emails | 500 emails/day |

---

## 5. Development Environment

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| MongoDB Compass | Optional — DB GUI |
| VS Code | Recommended editor |
| Thunder Client / Postman | API testing |

---

## 6. Deployment Considerations (Future)

- **Backend:** Railway, Render, or AWS EC2
- **Frontend:** Vercel or Netlify
- **Environment:** Set `NODE_ENV=production` — enables HTTPS-only cookies
- **CORS:** Update `CLIENT_URL` to production frontend domain
- **MongoDB:** Upgrade Atlas cluster for production workloads
- **Cloudinary:** Create production account under gym owner email