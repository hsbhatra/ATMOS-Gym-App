# Backend Schema Document
## ATMOS Gym Web Application

---

## 1. Database Overview

**Database:** MongoDB Atlas  
**ODM:** Mongoose v8  
**Collections:** 4 (authentication phase)

```
atmos-gym-dev (database)
├── users
├── otps
├── sessions
└── tempregistrations
```

---

## 2. Collection: `users`

The permanent record of every verified member, trainer, and admin.

### Schema

| Field | Type | Required | Unique | Default | Notes |
|-------|------|----------|--------|---------|-------|
| `_id` | ObjectId | Auto | Yes | Auto | MongoDB primary key |
| `userId` | String | No | Yes (sparse) | Auto-generated | e.g. `atmgym_0001` |
| `firstName` | String | Yes | No | — | trim, min 2, max 50 |
| `lastName` | String | Yes | No | — | trim, min 2, max 50 |
| `email` | String | Yes | Yes | — | lowercase, trim, validated |
| `phoneNumber` | String | Yes | Yes | — | Indian 10-digit format |
| `passwordHash` | String | Yes | No | — | bcrypt cost 12, select: false |
| `role` | String | No | No | `"member"` | enum: member, trainer, admin |
| `isEmailVerified` | Boolean | No | No | `false` | true after OTP verification |
| `isActive` | Boolean | No | No | `true` | false = suspended by admin |
| `profilePicture` | String | No | No | `null` | Cloudinary secure URL |
| `profilePicturePublicId` | String | No | No | `null` | Cloudinary public_id for deletion |
| `height` | Number | No | No | `null` | cm, min 50, max 300 |
| `weight` | Number | No | No | `null` | kg, min 20, max 500 |
| `dateOfBirth` | Date | No | No | `null` | cannot be future date |
| `gender` | String | No | No | `null` | enum: male, female, other, preferNotToSay |
| `bio` | String | No | No | `null` | max 200 characters |
| `createdAt` | Date | Auto | No | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | No | Auto | Mongoose timestamps |

### Indexes
```
email_1          → unique index (from unique: true)
phoneNumber_1    → unique index (from unique: true)
userId_1         → unique sparse index
role_1_isActive_1 → compound index for admin queries
```

### Pre-Save Hooks
```
Hook 1: if passwordHash modified → bcrypt.hash(passwordHash, 12)
Hook 2: if new document + no userId → generate "atmgym_XXXX"
```

### Instance Methods
```
comparePassword(candidatePassword) → bcrypt.compare → boolean
```

### Virtuals
```
fullName → `${firstName} ${lastName}`
```

### toJSON Transform
```
Removes: passwordHash, __v
```

---

## 3. Collection: `otps`

Temporary storage for OTP codes during email verification and password reset.

### Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Auto | Auto | — |
| `userId` | ObjectId (ref: User) | No | `null` | null during registration (user doesn't exist yet) |
| `email` | String | Yes | — | lowercase, trim, indexed |
| `otpHash` | String | Yes | — | SHA-256 hash of raw OTP, select: false |
| `purpose` | String | Yes | — | enum: `registration`, `forgotPassword` |
| `attempts` | Number | No | `0` | incremented on wrong OTP |
| `maxAttempts` | Number | No | `3` | from OTP_CONFIG.MAX_ATTEMPTS |
| `isUsed` | Boolean | No | `false` | true after successful verification |
| `expiresAt` | Date | Yes | now + 10 min | TTL index target |
| `createdAt` | Date | Auto | Auto | timestamps |
| `updatedAt` | Date | Auto | Auto | timestamps |

### Indexes
```
expiresAt_1        → TTL index (expireAfterSeconds: 0) — auto-deletes after 10 min
email_1_purpose_1_isUsed_1 → compound for OTP lookup queries
```

### Static Methods
```
generateOtp()          → { rawOtp: string, otpHash: string }
verifyOtp(submitted, stored) → boolean (timing-safe comparison)
```

### Instance Methods
```
isValid()      → !isUsed && expiresAt > now && attempts < maxAttempts
isExhausted()  → attempts >= maxAttempts
```

### toJSON Transform
```
Removes: otpHash, __v
```

### Security Notes
- Raw OTP: `crypto.randomInt(100000, 999999)` — cryptographically secure
- Hash: `crypto.createHash("sha256").update(rawOtp).digest("hex")`
- Comparison: `crypto.timingSafeEqual()` — prevents timing attacks
- Cross-use prevention: `purpose` field ensures registration OTP ≠ password reset OTP

---

## 4. Collection: `sessions`

Tracks every active login session. Powers device management and token revocation.

### Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Auto | Auto | Also used as sessionId in JWT payload |
| `userId` | ObjectId (ref: User) | Yes | — | indexed for fast user session lookup |
| `refreshTokenHash` | String | Yes | — | SHA-256 hash of raw refresh token, select: false |
| `deviceInfo.userAgent` | String | No | `"Unknown"` | raw User-Agent header |
| `deviceInfo.ipAddress` | String | No | `"Unknown"` | request IP |
| `deviceInfo.deviceName` | String | No | `"Unknown Device"` | parsed e.g. "Chrome on Windows" |
| `deviceInfo.platform` | String | No | `"Unknown"` | e.g. "Windows", "iOS" |
| `isActive` | Boolean | No | `true` | false = revoked |
| `lastUsedAt` | Date | No | `Date.now` | updated on every token refresh |
| `expiresAt` | Date | Yes | now + 30 days | TTL index target |
| `createdAt` | Date | Auto | Auto | timestamps |
| `updatedAt` | Date | Auto | Auto | timestamps |

### Indexes
```
expiresAt_1        → TTL index (expireAfterSeconds: 0) — auto-deletes after 30 days
userId_1_isActive_1 → compound for device limit queries
```

### Static Methods
```
generateRefreshToken()              → crypto.randomBytes(64).toString("hex") — 128 char hex
hashToken(rawToken)                 → SHA-256 hex string
countActiveSessions(userId)         → number of active, non-expired sessions
getOldestActiveSession(userId)      → session document (sort by createdAt ASC)
```

### Instance Methods
```
isValid()   → isActive && expiresAt > now
touch()     → update lastUsedAt → save()
revoke()    → isActive = false → save()
```

### Device Limit Logic
```
On login:
  count = countActiveSessions(userId)
  if count >= MAX_ACTIVE_DEVICES (2):
    oldest = getOldestActiveSession(userId)
    oldest.revoke()
  create new session
```

### toJSON Transform
```
Removes: refreshTokenHash, __v
```

---

## 5. Collection: `tempregistrations`

Temporary holding area for unverified registration data. Prevents ghost accounts in the users collection.

### Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | Auto | Auto | — |
| `firstName` | String | Yes | — | trim, min 2, max 50 |
| `lastName` | String | Yes | — | trim, min 2, max 50 |
| `email` | String | Yes | Unique | lowercase, trim, validated |
| `phoneNumber` | String | Yes | — | Indian 10-digit format |
| `passwordHash` | String | Yes | — | bcrypt hashed, select: false |
| `expiresAt` | Date | Yes | now + 15 min | TTL index target |
| `createdAt` | Date | Auto | Auto | timestamps |
| `updatedAt` | Date | Auto | Auto | timestamps |

### Indexes
```
expiresAt_1 → TTL index (expireAfterSeconds: 0) — auto-deletes after 15 min
email_1     → unique index — prevents duplicate pending registrations
```

### Pre-Save Hook
```
if passwordHash modified → bcrypt.hash(passwordHash, 12)
```

### Static Methods
```
findByEmail(email)              → finds non-expired doc with +passwordHash selected
hasPendingRegistration(email)   → boolean
```

### Instance Methods
```
isValid()        → expiresAt > now
refreshExpiry()  → expiresAt = now + 15 min → save()
```

### Lifecycle
```
1. Registration form submitted → TempRegistration created (upsert by email)
2. OTP verified → data copied to User collection → TempRegistration deleted
3. Abandoned → TTL index auto-deletes after 15 minutes
```

---

## 6. TTL Index Summary

| Collection | Field | TTL | Auto-Deletes When |
|------------|-------|-----|-------------------|
| `otps` | `expiresAt` | 0s after expiresAt | OTP expires (10 min after creation) |
| `sessions` | `expiresAt` | 0s after expiresAt | Session expires (30 days after creation) |
| `tempregistrations` | `expiresAt` | 0s after expiresAt | Registration abandoned (15 min after creation) |

MongoDB checks TTL indexes every 60 seconds — actual deletion may be up to 60 seconds after `expiresAt`.

---

## 7. Relationships

```
User (1) ──────────────── (many) Session
  └── userId in Session references User._id

User (1) ──────────────── (many) OTP
  └── userId in OTP references User._id (nullable during registration)

TempRegistration ── independent
  └── no foreign key — identified by email only
```

---

## 8. Future Collections (Planned)

| Collection | Purpose |
|------------|---------|
| `memberships` | Membership plans (Basic, Pro, Elite) with pricing |
| `subscriptions` | Which user has which plan, expiry dates |
| `trainers` | Extended trainer profiles, certifications, specializations |
| `workoutplans` | Trainer-created plans assigned to members |
| `workoutlogs` | Member's logged workout sessions |
| `measurements` | Body measurement history (weight, BMI over time) |
| `classes` | Group class schedules |
| `bookings` | Class bookings by members |
| `payments` | Payment transactions (Razorpay integration) |
| `announcements` | Admin-posted gym announcements |
