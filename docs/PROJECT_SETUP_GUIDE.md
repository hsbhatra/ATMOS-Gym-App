# Project Setup Guide
## ATMOS Gym Web Application
### Complete Guide for New Developers

---

## Prerequisites

Before you start, make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | nodejs.org |
| npm | 9 or higher | comes with Node.js |
| Git | Any recent | git-scm.com |
| VS Code | Any | code.visualstudio.com |

Verify your installations:
```bash
node --version   # should show v18.x.x or higher
npm --version    # should show 9.x.x or higher
git --version    # any version is fine
```

---

## Part 1: Accounts You Need to Create

### 1.1 MongoDB Atlas (Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project called "atmos-gym"
4. Build a cluster → choose **FREE** (M0 Shared)
5. Choose any cloud provider and region closest to you
6. Click **Create Cluster** (takes 1–3 minutes)
7. In the left sidebar → **Database Access** → Add Database User
   - Username: `atmos-admin`
   - Password: generate a secure password → copy it
   - Role: `Atlas admin`
8. In the left sidebar → **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
9. In the left sidebar → **Database** → Click **Connect** on your cluster
10. Choose **Connect your application**
11. Copy the connection string — it looks like:
    ```
    mongodb+srv://atmos-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
12. Replace `<password>` with your actual password

---

### 1.2 Cloudinary (Image Storage)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Create a free account
3. After login, go to your **Dashboard**
4. You will see three values — copy all three:
   - **Cloud name** (e.g. `dxxx1234`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcdefghijklmnopqrstuvwxyz12`)

---

### 1.3 Gmail App Password (Email Service)

> You need a Gmail account for sending OTP emails. Use a dedicated account for the app, not your personal Gmail.

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google" → click **2-Step Verification**
4. Make sure 2-Step Verification is **turned ON** (required for App Passwords)
5. Go back to Security → scroll down → click **App passwords**
   - If you don't see this option, 2-Step Verification is not enabled
6. Select app: **Mail** → Select device: **Windows Computer** (or any)
7. Click **Generate**
8. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop`)
9. Remove the spaces when you use it: `abcdefghijklmnop`

---

## Part 2: Clone and Setup

### 2.1 Clone the Repository

```bash
git clone https://github.com/hsbhatra/ATMOS-Gym-App.git
cd ATMOS-Gym-App
```

You should see this structure:
```
ATMOS-Gym-App/
├── backend/
├── frontend/
└── docs/
```

---

### 2.2 Backend Setup

```bash
cd backend
npm install
```

Create the environment file:
```bash
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Open `.env` in VS Code and fill in all values:

```env
# Server
PORT=8000
NODE_ENV=development

# Database — paste your MongoDB connection string here
MONGO_URI=mongodb+srv://atmos-admin:yourpassword@cluster0.xxxxx.mongodb.net/atmos-gym-dev?retryWrites=true&w=majority

# JWT Secret — generate a strong random string
# Run this command to generate one:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
ACCESS_TOKEN_SECRET=paste_your_generated_secret_here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Gmail credentials
EMAIL_USER=your.gym.email@gmail.com
EMAIL_PASS=abcdefghijklmnop

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Generate the ACCESS_TOKEN_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as `ACCESS_TOKEN_SECRET`.

Start the backend:
```bash
npm run dev
```

You should see:
```
Server running on port 8000
MongoDB Connected
```

Test it:
```bash
curl http://localhost:8000/api/health
# Should return: {"success":true,"message":"API is healthy"}
```

---

### 2.3 Frontend Setup

Open a **new terminal** (keep backend running):

```bash
cd frontend
npm install
```

Create the environment file:
```bash
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Open `frontend/.env` and fill in:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Start the frontend:
```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in 1234 ms
➜  Local:   http://localhost:5173/
```

Open your browser and go to `http://localhost:5173`

You should see the ATMOS Gym landing page with the 3D particle animation.

---

## Part 3: Verify Everything Works

Run through this checklist:

### 3.1 Backend Health
```
✅ GET http://localhost:8000/api/health → { "success": true }
```

### 3.2 Registration Flow
```
1. Go to http://localhost:5173/register
2. Fill in all fields with valid data
3. Click "Create Account"
4. ✅ You should receive an OTP email within 30 seconds
5. Enter the OTP
6. ✅ You should be redirected to the landing page, logged in
```

### 3.3 Login Flow
```
1. Go to http://localhost:5173/login
2. Enter your email and password
3. ✅ You should be logged in and redirected to landing page
```

### 3.4 Session Persistence
```
1. While logged in, press F5 (refresh)
2. ✅ You should still be logged in (not redirected to login)
```

### 3.5 Profile
```
1. Click "My Profile" in the navbar
2. ✅ Your profile should load with your details
3. Click "Edit Profile" → change first name → Save
4. ✅ Name should update
5. Upload a profile picture
6. ✅ Picture should appear from Cloudinary URL
```

---

## Part 4: Common Issues and Fixes

### Issue: "MongoDB connection failed"
**Cause:** Wrong MONGO_URI or IP not whitelisted  
**Fix:**
1. Check your MONGO_URI has the correct password (no `<>` angle brackets)
2. In MongoDB Atlas → Network Access → make sure `0.0.0.0/0` is allowed
3. Make sure the database name is in the URI: `.../atmos-gym-dev?retryWrites...`

### Issue: "Cannot send OTP email"
**Cause:** Wrong EMAIL_PASS or 2FA not enabled on Gmail  
**Fix:**
1. Make sure 2-Step Verification is ON in your Google account
2. Generate a fresh App Password (the old one may have expired)
3. Make sure there are no spaces in EMAIL_PASS in your .env

### Issue: "Cloudinary upload failed"
**Cause:** Wrong Cloudinary credentials  
**Fix:**
1. Log into cloudinary.com and copy credentials fresh from Dashboard
2. Make sure CLOUDINARY_API_SECRET is the full string (it's long)

### Issue: "CORS error in browser console"
**Cause:** CLIENT_URL in backend .env doesn't match frontend URL  
**Fix:**
1. Make sure `CLIENT_URL=http://localhost:5173` in backend `.env`
2. Restart the backend server after changing .env

### Issue: "Page shows blank / white screen"
**Cause:** Usually a JavaScript error  
**Fix:**
1. Open browser DevTools (F12) → Console tab
2. Read the error message
3. Most common: a missing import or wrong file path

### Issue: "Session not restored after refresh"
**Cause:** Refresh token cookie not being sent  
**Fix:**
1. Make sure `withCredentials: true` in `src/services/api.js`
2. Make sure `credentials: true` in CORS config in backend `app.js`
3. Make sure `CLIENT_URL` exactly matches the frontend URL including port

---

## Part 5: VS Code Extensions (Recommended)

Install these for the best development experience:

| Extension | Purpose |
|-----------|---------|
| ESLint | JavaScript linting |
| Prettier | Code formatting |
| ES7+ React/Redux/React-Native snippets | React shortcuts |
| MongoDB for VS Code | View DB in editor |
| Thunder Client | API testing inside VS Code |
| GitLens | Better Git integration |
| Auto Rename Tag | Rename JSX tags simultaneously |
| Tailwind CSS IntelliSense | Tailwind class autocomplete |

---

## Part 6: Project Scripts Reference

### Backend (`/backend`)
```bash
npm run dev     # Start with nodemon (auto-restart on file change)
npm start       # Production start (no auto-restart)
```

### Frontend (`/frontend`)
```bash
npm run dev     # Vite dev server with HMR
npm run build   # Build for production (output: /dist)
npm run preview # Preview the production build locally
npm run lint    # Run ESLint
```

---

## Part 7: File Structure Reference

```
backend/src/
├── config/
│   ├── env.js          ← loads dotenv (imported first in server.js)
│   ├── db.js           ← MongoDB connection
│   └── cloudinary.js   ← Cloudinary SDK config
├── controllers/auth/
│   ├── authentication.controller.js  ← register, login, logout, sessions
│   └── password.controller.js        ← forgot, reset, change password
├── controllers/
│   └── profile.controller.js
├── middleware/
│   ├── auth/           ← authenticate, sessionGuard, authorize
│   ├── error/          ← errorHandler
│   ├── upload/         ← multer + cloudinary upload
│   └── validation/     ← Joi schemas for all routes
├── models/
│   ├── user.model.js
│   ├── otp.model.js
│   ├── session.model.js
│   └── tempRegistration.model.js
├── routes/
│   ├── health.routes.js
│   ├── auth/           ← authentication + password routes + index
│   └── profile.routes.js
├── services/auth/
│   ├── password.service.js
│   ├── otp.service.js
│   ├── email.service.js
│   ├── token.service.js
│   └── session.service.js
├── services/
│   └── profile.service.js
└── utils/
    ├── constants.js    ← ALL config values (OTP expiry, max devices, etc.)
    ├── apiResponse.js  ← Standard success response class
    ├── apiError.js     ← Standard error class with factory methods
    └── asyncHandler.js ← Wraps async controllers, catches errors

frontend/src/
├── components/
│   ├── three/ParticleBackground.jsx  ← 3D animation (used on all pages)
│   ├── ui/
│   │   ├── Logo.jsx
│   │   ├── AppLoader.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── PasswordStrength.jsx
│   └── layout/
│       ├── ProtectedRoute.jsx
│       ├── Navbar.jsx
│       └── Footer.jsx
├── hooks/
│   └── useAuthInit.js  ← restores session on page refresh
├── pages/
│   ├── LandingPage.jsx
│   ├── NotFoundPage.jsx
│   ├── auth/           ← Login, Register, OTP, Forgot, Reset pages
│   └── profile/        ← ProfilePage (with Sessions + Change Password tabs)
├── services/
│   ├── api.js          ← Axios instance + interceptors
│   ├── authService.js  ← All auth API calls
│   └── profileService.js ← All profile API calls
├── store/
│   └── authStore.js    ← Zustand auth state
└── utils/
    └── animations.js   ← All Framer Motion variants
```
