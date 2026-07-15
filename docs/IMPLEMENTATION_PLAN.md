# Implementation Plan
## ATMOS Gym Web Application

---

## 1. What's Done ✅

### Backend — Authentication System
- [x] Project setup (Node.js, Express, ES Modules, MongoDB Atlas)
- [x] Environment configuration (`src/config/env.js` — dotenv isolation)
- [x] Constants file (`src/utils/constants.js`) — single source of truth
- [x] **Models:** User, OTP, Session, TempRegistration
- [x] **Utils:** ApiResponse, ApiError, asyncHandler
- [x] **Services:** password, otp, email, token, session
- [x] **Middleware:** authenticate, sessionGuard, authorize, errorHandler, upload, validation (auth + password)
- [x] **Controllers:** authentication.controller, password.controller
- [x] **Routes:** auth routes (13 endpoints), profile routes (4 endpoints)
- [x] app.js — Helmet, CORS, sanitizer, cookie-parser, routes, error handler

### Backend — Profile Module
- [x] Cloudinary config (`src/config/cloudinary.js`)
- [x] Upload middleware (multer memory → Cloudinary stream)
- [x] Profile service (get, update, updatePicture, deletePicture)
- [x] Profile controller
- [x] Profile routes
- [x] User model updated with: userId, height, weight, dateOfBirth, gender, bio, profilePicturePublicId
- [x] Auto-generate userId on new user creation

### Frontend — Foundation
- [x] React 18 + Vite setup
- [x] Tailwind CSS + custom CSS variables
- [x] Responsive CSS system (mobile-first, 4 breakpoints)
- [x] Framer Motion — animation variants (`src/utils/animations.js`)
- [x] Axios instance with request + response interceptors
- [x] Zustand auth store (user, accessToken, isAuthenticated, isInitialized)
- [x] `useAuthInit` hook — session restoration on page refresh
- [x] React Router v6 — all routes configured
- [x] ProtectedRoute + PublicRoute components

### Frontend — Components
- [x] `ParticleBackground` — Three.js 3D animation (single component, used everywhere)
- [x] `Logo` — app logo with size variants
- [x] `Navbar` — responsive, transparent/solid, hamburger mobile menu
- [x] `Footer` — links, socials, copyright
- [x] `ConfirmDialog` — reusable confirmation popup
- [x] `PasswordStrength` — live password strength indicator
- [x] `AppLoader` — session restoration loading screen

### Frontend — Pages
- [x] **Landing Page** — 3D hero, programs, stats, trainers, equipment, pricing, testimonials, CTA, footer
- [x] **Login Page** — email + password, show/hide, forgot password link
- [x] **Register Page** — all fields, password strength, phone with +91 prefix
- [x] **Verify OTP Page** — 6-box input, auto-advance, paste, countdown, resend
- [x] **Forgot Password Page** — email entry, success state
- [x] **Forgot OTP Page** — same as verify OTP but for password reset flow
- [x] **Reset Password Page** — new password + confirm, strength indicator, success state
- [x] **Profile Page** — sidebar with 3 tabs (Profile, Sessions, Change Password)
- [x] **404 Page** — gym-themed not found page

### Security Implemented
- [x] Passwords: bcrypt cost 12, never stored raw
- [x] OTPs: SHA-256 hashed, timing-safe comparison, 3 attempt limit
- [x] Refresh tokens: opaque random bytes, SHA-256 hashed in DB
- [x] Access tokens: JWT 15 min, stored in JS memory (not localStorage)
- [x] HTTP-only cookies for refresh tokens
- [x] Email enumeration protection
- [x] Rate limiting ready (express-rate-limit installed)
- [x] Input validation (Joi on all routes)
- [x] NoSQL injection protection (manual sanitizer)
- [x] Security headers (Helmet)
- [x] CORS configured with credentials

---

## 2. What's Next 🚧

### Phase 2 — Member Features

#### Priority 1: Workout Tracking
- [ ] `workoutlogs` collection — exercises, sets, reps, weight, date
- [ ] Log workout endpoint
- [ ] Get workout history (with pagination)
- [ ] Workout history page (frontend)
- [ ] Basic analytics — total sessions this week/month

#### Priority 2: Body Measurement History
- [ ] `measurements` collection — weight, bodyFat, BMI over time
- [ ] Log measurement endpoint
- [ ] Measurement chart (recharts or Chart.js)
- [ ] Progress page (frontend)

#### Priority 3: Membership Plans
- [ ] `memberships` collection — plan name, price, features, duration
- [ ] `subscriptions` collection — userId, planId, startDate, endDate, status
- [ ] Membership page (frontend) — current plan display
- [ ] Plan selection flow

---

### Phase 3 — Trainer Features

- [ ] Trainer profile extended fields (certifications, specializations, experience, bio)
- [ ] Trainer directory page (public) — cards with filters
- [ ] Assigned members list (trainer dashboard)
- [ ] Workout plan creation
- [ ] Assign plan to member

---

### Phase 4 — Admin Features

- [ ] Admin dashboard route + page
- [ ] User management (list, search, filter, suspend, change role)
- [ ] Trainer management (assign trainer to member)
- [ ] Membership plan CRUD
- [ ] Class schedule management
- [ ] Basic analytics (total members, active subscriptions, revenue)

---

### Phase 5 — Content Pages

- [ ] About page — gym story, mission, values, team
- [ ] Contact page — form, location, map embed
- [ ] Class schedule page (public)
- [ ] Trainer directory (public)
- [ ] Blog/Articles system

---

### Phase 6 — Payments

- [ ] Razorpay integration
- [ ] Payment flow — select plan → pay → subscription activated
- [ ] Payment history
- [ ] Invoice generation (PDF)
- [ ] Subscription renewal reminders (email)

---

### Phase 7 — Advanced Features

- [ ] Real-time notifications (WebSockets / Socket.io)
- [ ] Direct messaging (trainer ↔ member)
- [ ] Progress photos
- [ ] Class booking system
- [ ] QR code check-in
- [ ] Multi-location support

---

### Phase 8 — Deployment

- [ ] Backend deployment (Railway or Render)
- [ ] Frontend deployment (Vercel)
- [ ] Production environment variables
- [ ] MongoDB Atlas production cluster
- [ ] Cloudinary production account (gym owner email)
- [ ] Domain setup + SSL
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Google Analytics or Plausible)

---

## 3. Known Issues / Technical Debt

| Issue | Priority | Status |
|-------|----------|--------|
| `SessionsPage.jsx` and `ChangePasswordPage.jsx` are placeholder files | Low | These features are built inside ProfilePage — placeholders can be removed or converted to redirects |
| Rate limiting middleware installed but not applied to routes | Medium | Apply `rateLimiter` middleware to auth routes |
| No email rate limiting (spam prevention) | Medium | Implement server-side email send tracking |
| Phone number change requires OTP re-verification | Medium | Not yet implemented — phone is currently read-only |
| No admin route protection in middleware | Medium | Authorize middleware exists but not applied to admin routes yet |
| ParticleBackground re-renders on every tab switch in Profile | Low | Consider using CSS visibility toggle instead of unmounting |

---

## 4. Timeline Estimate

| Phase | Estimated Time | Notes |
|-------|---------------|-------|
| Phase 2 — Member Features | 3–4 weeks | Core value delivery |
| Phase 3 — Trainer Features | 2–3 weeks | Depends on Phase 2 |
| Phase 4 — Admin Features | 3–4 weeks | Most complex |
| Phase 5 — Content Pages | 1–2 weeks | Mostly frontend |
| Phase 6 — Payments | 2–3 weeks | Razorpay integration |
| Phase 7 — Advanced | 4–6 weeks | WebSockets, real-time |
| Phase 8 — Deployment | 1 week | Infrastructure setup |

**Total estimated remaining work:** 16–23 weeks (part-time development)
