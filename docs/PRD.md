# Product Requirements Document (PRD)
## ATMOS Gym Web Application
**Version:** 1.0  
**Last Updated:** July 2026  
**Status:** In Development

---

## 1. Product Overview

### 1.1 Product Summary
ATMOS Gym is a full-stack web application for managing gym memberships, member profiles, trainer interactions, and fitness tracking. It targets both gym owners and members, providing a premium digital experience that matches the quality of a high-end gym.

### 1.2 Problem Statement
Most gym management software is either expensive enterprise software with poor UX, or basic tools that lack the features modern gyms need. ATMOS Gym fills this gap with a modern, beautiful, and feature-rich platform built specifically for the Indian fitness market.

### 1.3 Target Users
| User Type | Description |
|-----------|-------------|
| **Member** | Gym members who sign up, track progress, book classes, manage their profile |
| **Trainer** | Certified trainers who manage assigned members, create workout plans |
| **Admin** | Gym owners/managers who manage everything — users, trainers, plans, content |

### 1.4 Key Goals
- Deliver a premium user experience with 3D animations and dark theme
- Provide secure, reliable authentication with OTP verification
- Enable members to manage profiles, track fitness, and book services
- Give admins full control over the gym's digital presence
- Support future scaling to multiple gym locations

---

## 2. Features

### 2.1 Completed Features ✅

#### Authentication System
- Email + password registration with OTP email verification
- Secure login with JWT access tokens (15 min) + HTTP-only refresh tokens (30 days)
- Auto-refresh tokens — users stay logged in transparently
- Max 2 active sessions per user (device management)
- Per-device session revocation
- Logout from all devices
- Forgot password via OTP email
- Change password (requires current password verification)
- Role-based access control (member / trainer / admin)
- Email enumeration protection on all password flows
- OTP attempt limiting (max 3) with auto-resend
- 60-second cooldown between OTP resend requests

#### Profile Management
- View complete profile
- Edit personal info (first name, last name)
- Body information (height, weight, date of birth, gender)
- Bio / about me (max 200 characters)
- Profile picture upload to Cloudinary (400x400 auto-crop with face detection)
- Profile picture deletion
- Auto-generated readable member ID (e.g. `atmosgym_0001`)
- Account information display (member since, role, email verification status)
- Active sessions list with device info
- Per-session revocation from profile

#### Frontend
- 3D animated particle background (Three.js) on all pages
- Fully responsive design (mobile, tablet, laptop, desktop, TV)
- Dark theme with gold accents
- Framer Motion page transitions and scroll animations
- Password strength indicator (live feedback)
- 6-box OTP input with auto-advance, paste support, countdown timer
- Toast notifications for all user actions
- Session restoration on page refresh (no logout on F5)
- 404 page

### 2.2 Planned Features 🚧

#### Member Features
- Workout tracking (log exercises, sets, reps, weight)
- Body measurement history (weight, BMI trends)
- Progress photos
- Class booking and scheduling
- Membership plan management
- Payment history

#### Trainer Features
- Trainer profile with specializations, experience, certifications
- Assigned members list
- Create and assign workout plans
- Track member progress
- Direct messaging with assigned members

#### Admin Features
- User management (view, suspend, change roles)
- Trainer management (assign trainers to members)
- Membership plan creation and pricing
- Class schedule management
- Gym analytics dashboard
- Announcement system

#### Content Pages
- About page
- Contact page
- Blog/Articles
- Class schedule (public)
- Trainer directory (public)

---

## 3. User Stories

### Member
- As a member, I want to register with my email and verify it via OTP so my account is secure
- As a member, I want to stay logged in after closing the browser tab so I don't have to re-enter credentials every time
- As a member, I want to see which devices I'm logged into and be able to end sessions remotely
- As a member, I want to upload a profile picture that looks professional
- As a member, I want to track my height and weight over time

### Trainer
- As a trainer, I want a profile page showing my expertise and experience
- As a trainer, I want to see the list of members assigned to me

### Admin
- As an admin, I want to manage all user accounts
- As an admin, I want to assign trainers to members
- As an admin, I want to set membership pricing and manage plans

---

## 4. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load time | < 2 seconds on 4G |
| API response time | < 300ms for most endpoints |
| Uptime | 99.9% |
| Mobile support | iOS 14+, Android 10+ |
| Browser support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Security | OWASP Top 10 compliance |
| Accessibility | WCAG 2.1 AA |

---

## 5. Out of Scope (v1.0)
- Native mobile apps (iOS/Android)
- Multi-language support
- Payment processing (future Razorpay integration)
- Real-time features (WebSockets)
- Video streaming for workout tutorials