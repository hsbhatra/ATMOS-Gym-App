# App Flow Document
## ATMOS Gym Web Application

---

## 1. Registration Flow

```
Landing Page → Click "Join Now"
      ↓
/register
  - Enter: firstName, lastName, email, phoneNumber, password, confirmPassword
  - Live password strength indicator
  - Client validation (Joi mirrors)
  - Submit → POST /api/v1/auth/register
      ↓
  Backend:
  - Check email not already in users collection
  - Check phone not already registered
  - Validate password strength
  - Save to TempRegistration (TTL: 15 min)
  - Generate 6-digit OTP → SHA-256 hash → save to OTP collection
  - Send raw OTP to email (branded HTML template)
  - Return: { message: "OTP sent" }
      ↓
/verify-otp (purpose: "registration")
  - 6-box OTP input with auto-advance
  - Paste support (paste 6 digits → fills all boxes)
  - 60-second countdown timer
  - Wrong OTP → error + attempts remaining shown
  - 3 wrong attempts → auto-invalidate → new OTP sent → "New OTP sent" message
  - Correct OTP → POST /api/v1/auth/verify-registration-otp
      ↓
  Backend:
  - Verify OTP hash
  - Copy TempRegistration → User document
  - Set isEmailVerified: true
  - Auto-generate userId (e.g. "atmgym_0001")
  - Delete TempRegistration
  - Delete used OTPs
  - Create Session (device info captured)
  - Generate access token (JWT, 15 min)
  - Set refresh token cookie (HTTP-only, 30 days)
  - Return: { user, accessToken }
      ↓
  Frontend:
  - Store { user, accessToken } in Zustand
  - Show "Welcome to ATMOS Gym!" toast
  - Navigate to /
      ↓
Landing Page — logged in state (navbar shows "My Profile")
```

---

## 2. Login Flow

```
Landing Page → Click "Login"  OR  Any protected page → auto-redirect
      ↓
/login
  - Enter: email, password
  - "Forgot password?" link → /forgot-password
  - Submit → POST /api/v1/auth/login
      ↓
  Backend:
  - Find user by email (same error for wrong email OR wrong password)
  - Check isActive === true
  - Check isEmailVerified === true
  - bcrypt.compare(password, passwordHash)
  - If count of active sessions >= 2 → revoke oldest session
  - Create new Session
  - Generate access token
  - Set refresh token cookie
  - Return: { user, accessToken }
      ↓
  Frontend:
  - setAuth(user, accessToken) → Zustand
  - "Welcome back, [firstName]!" toast
  - Navigate to /
```

---

## 3. Session Restoration Flow (Page Refresh)

```
Browser refresh / new tab / return visit
      ↓
App.jsx mounts → useAuthInit hook fires
      ↓
  isInitialized === false → show AppLoader (pulsing A logo)
      ↓
  GET /api/v1/auth/refresh-token
  (HTTP-only cookie sent automatically by browser)
      ↓
  Cookie valid?
  ├── YES → new access token returned
  │         GET /api/v1/profile (with new token)
  │         setAuth(user, newToken) → Zustand
  │         isInitialized = true
  │         → App renders — user still logged in ✅
  │
  └── NO  → setInitialized() (logged out state)
             isInitialized = true
             → App renders — user is logged out
```

---

## 4. Token Refresh Flow (Background)

```
User makes API request (e.g. GET /profile)
      ↓
Access token expired (15 min passed)
      ↓
Backend returns 401
      ↓
Axios response interceptor catches 401
      ↓
isRefreshing === false?
  ├── YES → set isRefreshing = true
  │         GET /auth/refresh-token (cookie sent)
  │         New access token received
  │         Update Zustand store
  │         Process queue (retry all pending requests)
  │         Retry original request with new token
  │         → Original request succeeds ✅
  │
  └── NO  → Add original request to failedQueue
             Wait for refresh to complete
             Retry with new token when queue is processed
      ↓
Refresh failed? (cookie expired after 30 days)
  → storeLogout() → clear Zustand
  → window.location.href = "/login"
```

---

## 5. Logout Flows

### 5a. Single Device Logout
```
Profile Page → Click "Logout" (navbar)
      ↓
POST /api/v1/auth/logout (with access token)
      ↓
Backend:
- req.session from sessionGuard middleware
- session.revoke() → isActive: false
- Clear refresh token cookie (maxAge: 0)
      ↓
Frontend:
- storeLogout() → clear Zustand
- "Logged out successfully" toast
- Navigate to /
```

### 5b. Logout All Devices
```
Profile → Sessions tab → "Logout All Devices" button
      ↓
ConfirmDialog: "This will log you out from ALL devices"
      ↓
User confirms → POST /api/v1/auth/logout-all
      ↓
Backend:
- Session.updateMany({ userId, isActive: true }, { isActive: false })
- Clear refresh token cookie
      ↓
Frontend:
- storeLogout()
- Navigate to /login
```

---

## 6. Forgot Password Flow

```
/login → "Forgot password?" link
      ↓
/forgot-password
  - Enter email
  - Submit → POST /api/v1/auth/forgot-password
      ↓
  Backend (email enumeration protected):
  - Find user by email silently
  - If user exists + verified + active → generate OTP → send email
  - Always return same success message regardless
      ↓
  Frontend:
  - Show success state (✅ "OTP Sent!")
  - Store email in sessionStorage
  - "Enter OTP →" button → /forgot-otp
      ↓
/forgot-otp
  - Same 6-box OTP UI
  - Submit → POST /api/v1/auth/verify-forgot-otp
      ↓
  Backend:
  - Verify OTP
  - Mark OTP as isUsed: true
  - Return: { otpVerified: true }
      ↓
  Frontend:
  - Store otpVerified: "true" in sessionStorage
  - Navigate to /reset-password
      ↓
/reset-password
  - Guard: redirect to /forgot-password if !otpVerified in sessionStorage
  - Enter: newPassword, confirmNewPassword
  - Live password strength indicator
  - Submit → POST /api/v1/auth/reset-password
      ↓
  Backend:
  - Validate password strength
  - Confirm used OTP exists (prevents direct endpoint access)
  - Prevent same password reuse
  - Update passwordHash (pre-save hook hashes)
  - Delete all OTPs for this email + purpose
  - Return: success
      ↓
  Frontend:
  - Clear sessionStorage (pendingEmail, otpPurpose, otpVerified)
  - Show success state (✅ "Password reset!")
  - "Sign In Now →" → /login
```

---

## 7. Profile Management Flow

```
Logged-in user → Click "My Profile" (navbar)
      ↓
/profile
  ↓ (protected — redirects to /login if not authenticated)
  ↓
GET /api/v1/profile → loads user data
      ↓
Three tabs in sidebar:

[PROFILE TAB]
  - View: name, userId, role, email (readonly), phone (readonly)
  - View: height, weight, dateOfBirth, gender, bio
  - View: member since, email verified status
  - Click "Edit Profile" → fields become editable
  - Click "Save Changes" → PATCH /api/v1/profile
  - Click "Change Photo" → file picker → PATCH /api/v1/profile/picture
  - Click "Remove" → DELETE /api/v1/profile/picture

[SESSIONS TAB]
  - GET /api/v1/auth/sessions → list all active sessions
  - Each session shows: device name, platform, IP, last active time
  - Current device marked with "THIS DEVICE" badge
  - "End Session" → ConfirmDialog → POST /api/v1/auth/logout → navigate /login
  - "Logout All Devices" → ConfirmDialog → POST /api/v1/auth/logout-all → navigate /login

[CHANGE PASSWORD TAB]
  - Enter: currentPassword, newPassword, confirmNewPassword
  - Client-side validation
  - Submit → ConfirmDialog: "Are you sure?"
  - Confirm → POST /api/v1/auth/change-password
  - Success → logout + navigate /login
```

---

## 8. Navigation Flow

```
/ (Landing)
  ├── /register → /verify-otp → / (auto-login)
  ├── /login → /
  │   └── /forgot-password → /forgot-otp → /reset-password → /login
  └── /profile (protected)
      ├── Profile tab
      ├── Sessions tab
      └── Change Password tab

Unknown URL → /404
```