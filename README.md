# ATMOS Gym 💪

A full-stack gym management web application built with the MERN stack. Features a 3D animated dark-themed frontend, complete authentication system, profile management, and a scalable architecture for future gym features.

---

## Tech Stack

**Backend**
- Node.js + Express.js (ES Modules)
- MongoDB Atlas + Mongoose
- JWT Authentication + HTTP-only cookies
- Cloudinary (image storage)
- Nodemailer + Gmail (OTP emails)

**Frontend**
- React 18 + Vite
- Three.js (3D particle backgrounds)
- Framer Motion (animations)
- Tailwind CSS + custom CSS
- Zustand (auth state)
- Axios (API + auto token refresh)

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account with App Password

### 1. Clone the repository
```bash
git clone https://github.com/hsbhatra/ATMOS-Gym-App.git
cd ATMOS-Gym-App
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in VITE_API_URL
npm run dev
```

### 4. Open the app
```
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Health:   http://localhost:8000/api/health
```

---

## Environment Variables

### Backend `.env`
```
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
ACCESS_TOKEN_SECRET=your_64_char_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Project Structure

```
atmos-gym/
├── backend/
│   └── src/
│       ├── config/          # DB, Cloudinary, env config
│       ├── controllers/     # Request handlers
│       ├── middleware/       # Auth, validation, error, upload
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # Business logic
│       └── utils/           # Helpers, constants
└── frontend/
    └── src/
        ├── components/      # Reusable UI, layout, 3D components
        ├── hooks/           # Custom React hooks
        ├── pages/           # Page components
        ├── services/        # API call functions
        ├── store/           # Zustand state
        └── utils/           # Animation variants
```

---

## API Overview

All endpoints are prefixed with `/api/v1/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Start registration |
| POST | /auth/verify-registration-otp | No | Verify email OTP |
| POST | /auth/login | No | Login |
| POST | /auth/logout | Yes | Logout current device |
| POST | /auth/logout-all | Yes | Logout all devices |
| GET | /auth/sessions | Yes | Get active sessions |
| GET | /auth/refresh-token | Cookie | Refresh access token |
| POST | /auth/forgot-password | No | Send reset OTP |
| POST | /auth/reset-password | No | Reset password |
| POST | /auth/change-password | Yes | Change password |
| GET | /profile | Yes | Get profile |
| PATCH | /profile | Yes | Update profile |
| PATCH | /profile/picture | Yes | Upload profile picture |
| DELETE | /profile/picture | Yes | Remove profile picture |

---

## Scripts

### Backend
```bash
npm run dev    # Start with nodemon
npm start      # Production start
```

### Frontend
```bash
npm run dev    # Vite dev server
npm run build  # Production build
npm run preview # Preview production build
```