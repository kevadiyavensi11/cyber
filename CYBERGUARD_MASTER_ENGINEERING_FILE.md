# 🛡️ CYBERGUARD — PROJECT ENGINEERING MASTER FILE

> **Version:** Production v1.0  
> **Project Type:** Full-Stack Web Application (SaaS / Civic Tech / Law Enforcement Platform)  
> **Generated:** April 2026  
> **Stack:** Node.js · Express.js · MongoDB (Mongoose) · React.js (Vite) · Socket.IO · Google Gemini AI

---

## 📑 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Complete Feature Breakdown](#2-complete-feature-breakdown)
3. [Validation System](#3-validation-system)
4. [Business Logic Flow](#4-business-logic-flow)
5. [Algorithms & Data Logic](#5-algorithms--data-logic)
6. [Function-Level Documentation](#6-function-level-documentation)
7. [Error Handling Strategy](#7-error-handling-strategy)
8. [Edge Case Handling](#8-edge-case-handling)
9. [Security & Best Practices](#9-security--best-practices)
10. [Performance Optimization](#10-performance-optimization)
11. [Database Schema, API Endpoints & Architecture](#11-database-schema-api-endpoints--architecture)

---

## 1. 🧾 Project Overview

### Purpose
CyberGuard is a **multi-panel, AI-assisted cyber-crime incident reporting and management platform** designed for civic use. It enables citizens to report cyber threats, allows law enforcement officers to investigate cases, and provides administrators with full system oversight, analytics, and command controls.

### Core Problem Solved
- Citizens have no structured, accessible way to report cyber crimes (phishing, fraud, identity theft, etc.)
- Law enforcement lacks a centralized, automated case triage and assignment tool
- Administrators have no real-time visibility into regional threat distribution and SLA compliance

### Target Users

| Role | Panel | Access |
|------|-------|--------|
| **Citizen** | `citizen-panel` (Port 5174) | Submit reports, track status, chat with officer, pay fines |
| **Officer** | `officer-panel` (Port 5175) | Investigate assigned cases, add notes, update status |
| **Admin** | `frontend-admin` (Port 5173) | Full system control, user management, analytics, broadcasts |

### High-Level Workflow
```
Citizen Submits Report
       ↓
AI (Gemini) Validates Evidence Image → [REJECTED if invalid]
       ↓
SLA Calculated Based on Severity
       ↓
Zone Auto-Resolved from GPS Coordinates (Ray-Casting)
       ↓
Officer Auto-Assigned (Load-Balanced by Zone + Workload)
       ↓
Real-time Notifications (Socket.IO + DB) sent to Officer & Admin
       ↓
Officer Investigates → Updates Status → Chat with Citizen
       ↓
Investigation Complete → Fine Assessment (optional)
       ↓
Citizen Pays Fine (if applicable)
       ↓
Case Closed / Rejected
       ↓
Admin Audits via Logs, Analytics, Zone Map
```

---

## 2. 🧩 Complete Feature Breakdown

### 2.1 🔐 Authentication Module

#### Feature: Email/Password Login
- **Type:** Core
- **Inputs:** `email` (String), `password` (String)
- **Outputs:** JWT token, user `_id`, `role`, `name`
- **Logic:** Email regex validated → User fetched from DB → Blocked status checked → Officer status checked → `bcrypt.compare()` → JWT signed (30d expiry)
- **Trigger:** POST `/api/auth/login`
- **Dependencies:** `User` model, `bcryptjs`, `jsonwebtoken`
- **Edge Cases:** Google-only accounts (no password), blocked users, non-registered emails

#### Feature: Citizen Self-Registration
- **Type:** Core
- **Inputs:** `name`, `email`, `password`, `phone`
- **Outputs:** JWT token, user profile
- **Logic:** Duplicate email check → `User.create()` with `role: 'citizen'`, `status: 'active'` → Password auto-hashed via Mongoose pre-save hook
- **Trigger:** POST `/api/auth/register`
- **Note:** No OTP/email verification required on registration

#### Feature: Google OAuth Login (Citizens Only)
- **Type:** Core
- **Inputs:** Google `tokenId` from frontend
- **Outputs:** JWT token, user profile
- **Logic:** Google ID token verified via `google-auth-library` → If user exists & is officer → Rejected (officers cannot use Google login) → If new user → Auto-created as citizen with `password: null`
- **Trigger:** POST `/api/auth/google`
- **Dependencies:** `google-auth-library`, `OAuth2Client`

#### Feature: Forgot Password (3-Step OTP Flow)
- **Type:** Core
- **Step 1 — Send OTP:** POST `/api/auth/forgot-password` → Identifies user by email → Generates 6-digit OTP → Stores in `OTPVerification` collection with 5-minute TTL → Sends HTML email via Nodemailer (or SMS fallback)
- **Step 2 — Verify OTP:** POST `/api/auth/verify-reset-otp` → Checks OTP + expiry against `OTPVerification`
- **Step 3 — Reset Password:** POST `/api/auth/reset-password` → Re-validates OTP → Updates `user.password` → Triggers pre-save bcrypt hashing → Cleans up OTP record
- **Email masking:** Email partially masked in response: `us*****r@domain.com`

#### Feature: Profile Update + Avatar Upload
- **Type:** Secondary
- **Inputs:** `name`, `email`, `password` (optional), avatar image file
- **Outputs:** Updated user object + new JWT
- **Trigger:** PUT `/api/auth/profile`
- **Logic:** Multer disk storage saves avatar to `/uploads/avatars/` using format `{userId}-{timestamp}.ext` → Avatar URL stored as absolute path `http://localhost:5000/uploads/avatars/{file}`

---

### 2.2 📋 Report Submission Module (Citizen Panel)

#### Feature: Submit Cyber Incident Report
- **Type:** Core
- **Inputs:** `threatTitle`, `description`, `threatType` (enum), `urlOrPhone`, `severity` (enum), evidence file (image/pdf), `latitude`, `longitude`, `address`, `zone`
- **Outputs:** Saved report with SLA, zone, assignment, AI metadata
- **Trigger:** POST `/api/reports/create`
- **10 Threat Types:** Phishing Attack, Malware Infection, Ransomware, Data Breach, Social Engineering, Identity Theft, Financial Fraud, Unauthorized Access, Suspicious Email/Link, Other Cyber Threat
- **4 Severity Levels:** Low, Medium, High, Critical

#### Feature: AI Evidence Pre-Scan (Pre-Submission)
- **Type:** Core (AI Integration)
- **Trigger:** POST `/api/reports/analyze-evidence`
- **Process:** Uploaded image → Gemini API → Returns `{isValid, detectedThreat, confidence, summary}`
- **Used For:** Inline frontend feedback before final submission

#### Feature: Report Reopen (Citizen)
- **Type:** Secondary
- **Trigger:** PUT `/api/reports/reopen/:id`
- **Logic:** Citizens can request to reopen closed/rejected cases (limited by `reopenAttempts` counter)

#### Feature: Payment Processing (Citizen)
- **Type:** Core
- **Trigger:** PUT `/api/reports/pay/:id`
- **Logic:** Citizen pays assessed fine → Report `paymentStatus` updated to `Completed` / `Paid` → `Payment` record created → Report moves to allow Case Closed transition

---

### 2.3 🔍 Investigation Module (Officer Panel)

#### Feature: View Assigned Cases
- **Type:** Core
- **Trigger:** GET `/api/reports/officer/:id`
- **Outputs:** All reports where `assignedTo === officerId`, populated with citizen `name` and `email`

#### Feature: Update Case Status (Full State Machine)
- **Type:** Core
- **Trigger:** PUT `/api/reports/update-status/:id`
- **Valid Status Transitions:**
  - `Pending` → `Assigned` → `Investigating` → `Investigation Completed` → `Payment Pending` / `Case Closed`
  - `Investigation Completed` → `Rejected`
  - `Payment Pending` → `Payment Completed` → `Case Closed`
  - Any open status → `Reopened`
- **Guards:** Case Closed blocked if payment pending; SLA breached cases locked for non-admins

#### Feature: Add Investigation Notes
- **Type:** Core
- **Trigger:** POST `/api/reports/:id/notes`
- **Logic:** Note saved to `report.investigationNotes[]` array with `addedBy` officer reference → Citizen notified via `createNotification()`

#### Feature: Add Evidence to Case
- **Type:** Secondary
- **Trigger:** POST `/api/reports/:id/evidence`
- **Logic:** Officer can add file (image/document), external link, or text evidence to `report.evidence[]` array

#### Feature: Real-time Investigation Chat
- **Type:** Core
- **Transport:** Socket.IO `sendMessage` event → Saved to `Message` collection → Broadcast to `reportId` room
- **Participants:** Citizen (report creator) and Officer (assigned only)
- **Message Types:** `text`, `image`, `file`
- **Security:** Server validates that `citizen.senderId === report.createdBy` and `officer.senderId === report.assignedTo` before persisting

#### Feature: Case Escalation
- **Type:** Secondary
- **Trigger:** PUT `/api/reports/:id/escalate`
- **Access:** Officer only

#### Feature: Officer Dashboard Stats
- **Type:** UI
- **Trigger:** GET `/api/dashboard/officer-stats/:id`
- **Returns:** Assigned Cases, Pending, In Progress, SLA Breached, Resolved counts

---

### 2.4 🛠️ Admin Panel Modules

#### Feature: User Management (CRUD)
- **Type:** Core (Admin)
- **Actions:**
  - GET `/api/admin/users` — List all users
  - POST `/api/admin/officer/add` — Create officer (with zone assignment)
  - PUT `/api/admin/user/:id` — Update user details/zone
  - DELETE `/api/admin/user/:id` — Delete user (admin self-delete blocked)
  - PATCH `/api/admin/user-status/:id` — Toggle Active/Blocked status

#### Feature: Manual Report Reassignment
- **Type:** Core (Admin)
- **Logic:** Admin can reassign report to any officer (cross-zone allowed with `assignment_type: 'manual'`). Automatic assignments enforce zone matching. Workload counters (`assignedReportsCount`) are decremented for old officer and incremented for new.

#### Feature: Report Editing (Admin)
- **Type:** Core (Admin)
- **Trigger:** PUT `/api/reports/edit/:id`
- **Editable Fields:** `threatTitle`, `threatType`, `severity`, `description`
- **Triggers:** Real-time Socket emission of `reportUpdated` event

#### Feature: Report Deletion (Admin)
- **Type:** Core (Admin)
- **Trigger:** DELETE `/api/reports/:id`

#### Feature: Admin Dashboard Analytics
- **Type:** UI (Admin)
- **Trigger:** GET `/api/dashboard/admin-stats`
- **Data Returned:**
  - Total Citizens, Officers, Reports, Resolved Cases
  - SLA Breaches count (active, non-closed)
  - Fines Collected (sum of `fineAmount` where `paymentStatus: 'Paid'`)
  - Severity Distribution (MongoDB `$group` aggregate)
  - Threat Type Distribution (MongoDB `$group` aggregate)

#### Feature: Broadcast Notification System
- **Type:** Core (Admin)
- **Trigger:** POST `/api/notifications/send` with `broadcast: true`
- **Target Options:** `all`, `citizen`, `officer`, `admin`
- **Logic:** Fetches all matching users → `Notification.insertMany()` → Socket emits to `role:{target}` room or global broadcast
- **Logging:** System log entry created via `createLog()`

#### Feature: Admin Zone Map (Spatial Command Center)
- **Type:** Core (Admin)
- **Page:** `AdminZoneMap.jsx`
- **Features:** Interactive Leaflet.js map with jurisdictional zone polygons, incident marker overlays, zone selection for filtering, report analysis overlays

#### Feature: Audit Logs
- **Type:** System (Admin)
- **Trigger:** GET `/api/admin/audit-logs`
- **Returns:** Last 100 audit entries with user population, sorted by `createdAt DESC`

#### Feature: System Logs
- **Type:** System (Admin)
- **Trigger:** GET `/api/system-logs`
- **Record Structure:** `level`, `category`, `message`, `userId`, `metadata`, `timestamps`

#### Feature: SLA Extension (Admin Override)
- **Type:** Secondary (Admin)
- **Trigger:** PUT `/api/reports/:id/extend-sla`
- **Use Case:** Admin can manually extend SLA deadline for breached cases

---

### 2.5 🔔 Notification System

#### Feature: Personal Notifications (All Roles)
- **Trigger Sources:** Auto-assignment, status update, officer note added, payment received, SLA breach
- **Schema Fields:** `userId`, `role`, `title`, `message`, `type` (system/warning/update/assignment), `read`, `reportId`
- **Real-time:** Socket.IO `newNotification` event emitted to `userId` room
- **API:**
  - GET `/api/notifications/user/:id` — Fetch (last 50)
  - PATCH `/api/notifications/mark-read/:id` — Mark single read
  - PATCH `/api/notifications/mark-all-read/:id` — Mark all read
  - GET `/api/notifications/unread-count/:id` — Unread badge count

#### Feature: Broadcast Notifications
- **Type:** Admin-initiated mass communication
- **Socket Events:** `broadcastNotification` (all) or `newNotification` to `role:{target}` room

---

### 2.6 📡 Real-Time Features (Socket.IO)

| Socket Event | Direction | Room | Description |
|---|---|---|---|
| `join` | Client → Server | `userId` | User joins personal notification room |
| `joinRole` | Client → Server | `role:{role}` | User joins role-based broadcast room |
| `joinReportRoom` | Client → Server | `reportId` | User joins case investigation room |
| `sendMessage` | Client → Server | `reportId` | Send chat message (validated server-side) |
| `newMessage` | Server → Client | `reportId` | Broadcast new message to room |
| `markSeen` | Client → Server | `reportId` | Mark messages as seen |
| `messagesSeen` | Server → Client | `reportId` | Notify sender messages were seen |
| `newReportCreated` | Server → Client | `role:admin`, `role:officer` | Admin/Officer dashboard live update |
| `reportUpdated` | Server → Client | `reportId` | Live case status sync |
| `newNotification` | Server → Client | `userId` / `role:{role}` | Personal/broadcast notification |
| `broadcastNotification` | Server → Client | Global | System-wide announcement |

---

### 2.7 📄 PDF Report Generation

- **Trigger:** GET `/api/reports/:id/pdf`
- **Library:** `pdfkit`
- **Access:** All authenticated roles
- **Content:** Report details, timeline, investigation notes, SLA status, resolution summary

---

### 2.8 🗺️ Zone Management

- **Zone Data Model:** `name`, `code`, `description`, `polygon[]` (array of `{lat, lng}` coordinates)
- **9 Predefined Zones:** Central, North, South, East, West, North-East, North-West, South-East, South-West
- **Auto-Seeding:** Zones seeded on server startup if collection is empty
- **Admin Management:** POST `/api/admin/zones` to add zones, GET `/api/admin/zones` to list

---

## 3. ✅ Validation System

### 3.A Frontend Validations

#### Citizen — Submit Report Form
| Field | Validation | Rule |
|---|---|---|
| `threatTitle` | Required | Min 5 chars |
| `threatType` | Required | Must match enum (dropdown) |
| `description` | Required | Min 20 chars |
| `severity` | Required | Low / Medium / High / Critical |
| `evidenceURL` | Optional | External URL format check if provided |
| `evidence` (file) | Optional | `.jpg`, `.jpeg`, `.png`, `.pdf` only |
| `latitude/longitude` | Optional (auto-captured via browser Geolocation API) | Numeric; used for zone auto-resolution |

#### Auth Forms — Login
| Field | Validation |
|---|---|
| `email` | Regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
| `password` | Min length 6 (frontend), required |

#### Auth Forms — Register
| Field | Validation |
|---|---|
| `name` | Required, non-empty |
| `email` | Email regex |
| `password` | Min 6 chars, confirmation match |
| `phone` | Optional, numeric |

#### OTP Form
| Field | Validation |
|---|---|
| `otp` | 6-digit numeric, required |
| Expiry | 5 minutes from server issue time |

#### Admin — Add Officer
| Field | Validation |
|---|---|
| `name`, `email`, `password` | All required |
| `zone` | Must be one of 9 predefined zones |

#### UX Validation Behavior
- Inline error messages appear below each field on blur or submit
- Submit button disabled when form is invalid
- File type filter applied at `<input type="file" accept="image/*, application/pdf">` level
- Loading spinner shown during async operations (AI scanning, form submission)

---

### 3.B Backend Validations

#### Authentication
- **Email format:** Regex validated in `loginUser` before DB query
- **Duplicate email:** `User.findOne({ email })` checked on registration and officer creation
- **Password existence:** Google-auth users have `password: null`; system returns specific error if login attempted with password
- **Status enforcement:** `blocked` → 403; officer `!== 'active'` → 403
- **Role guard on Google login:** Officers blocked from Google OAuth path

#### Report Creation
- **Required schema fields enforced** by Mongoose: `threatTitle`, `description`, `threatType`, `severity`, `zone`, `createdBy`
- **`threatType` enum validation:** Mongoose rejects unknown values
- **`severity` enum validation:** `['Low', 'Medium', 'High', 'Critical']`
- **`zone` enum validation:** 9 directional zones enforced
- **ObjectId validation:** `mongoose.Types.ObjectId.isValid(id)` called in `getOfficerReports` and `getReportById`
- **Hexadecimal ID format:** `/^[0-9a-fA-F]{24}$/` regex in `getReportById`

#### Report Status Update
- **Case Closed guard:** `paymentStatus !== 'Completed'` blocks closure if fines exist
- **SLA breach guard:** Non-admin users cannot resolve breached cases — returns 403
- **Zone jurisdiction check:** Automatic assignment rejects cross-zone officer assignments
- **Officer role check:** `newOfficer.role !== 'officer'` → 400 error

#### File Upload (Multer)
- **Allowed types:** `.jpg`, `.jpeg`, `.png`, `.pdf`
- **MIME type + extension double-check** in `checkFileType()`
- **Storage path:** `uploads/` directory with format `{fieldname}-{timestamp}.{ext}`

#### Notification
- **Broadcast role validation:** Normalizes to lowercase before querying users
- **`userId` required** for individual notifications

---

### 3.C Security Validations

#### JWT Verification (`authMiddleware.js`)
```
Authorization: Bearer <token>
  → jwt.verify(token, process.env.JWT_SECRET)
  → User.findById(decoded.id).select('-password')
  → Check user.status !== 'blocked'
  → Attach req.user for downstream use
```
- 401 if no token
- 401 if token verification fails (expired, tampered)
- 403 if user is blocked

#### RBAC (`authorize(...roles)`)
- Role comparison is **case-insensitive** (normalized to lowercase)
- `authority` role alias → normalized to `officer`
- Routes explicitly declare allowed roles: `authorize('citizen')`, `authorize('officer', 'admin')`, `authorize('admin')`

#### Socket.IO Authorization
- **Citizen identity verified** before message persistence: `report.createdBy.toString() !== senderId.toString()` → silently drops
- **Officer identity verified**: `report.assignedTo?.toString() !== senderId.toString()` → silently drops
- No unauthenticated WebSocket writes permitted

#### Input Sanitization
- **JSON body parsed** by `express.json()` — no raw SQL/NoSQL query parameters accepted in body
- **MongoDB ObjectId validation** before any `findById()` call prevents CastError injection
- **`html-entities` package** available for HTML encoding where needed

#### API Rate Limiting
- No third-party rate limiter currently configured (recommended: `express-rate-limit` for production)

#### File Security
- File type validated by both extension and MIME type (dual check)
- Files stored outside web root in `/uploads/` served via `express.static('uploads')` — no directory traversal possible with `path.extname()` usage

#### XSS Protection
- Express does not auto-escape output; HTML responses are JSON-only (no template engine)
- `html-entities` package imported for any HTML content operations
- `Cache-Control: no-store` header applied globally via middleware to prevent sensitive data caching

#### CORS
- `cors()` middleware applied globally (`Access-Control-Allow-Origin: *`)
- **Production recommendation:** Restrict to specific frontend origins

---

## 4. 🧠 Business Logic Flow

### 4.1 Report Submission Flow (Full Pipeline)

```
1. Citizen submits form (POST /api/reports/create)
2. IP address extracted from request headers
3. Evidence file saved to disk (Multer)
4. Zone Resolution:
   a. If zone provided in body → use it
   b. Else if lat/lng provided → run resolveZone() (Ray-Casting)
   c. Else → fallback to 'Central'
5. Report created in DB with status: 'Pending', SLA calculated
6. IF evidence file uploaded:
   a. Call analyzeThreatImage() → Gemini AI
   b. IF not valid (isValid: false) → status = 'Rejected', return 400
   c. IF valid + confidence ≥ 0.85 → status = 'Verified', AI metadata saved
   d. IF AI service unavailable → report remains Pending (manual review)
7. Officer Auto-Assignment:
   a. Query officers: { role: 'officer', zone: report.zone, isActive: true }
   b. Sort by assignedReportsCount ASC (load balancing)
   c. Select officers[0]
   d. report.assignedTo = officer._id, status = 'Assigned'
   e. officer.assignedReportsCount += 1
8. Notifications dispatched:
   a. To assigned officer: 'New Automated Assignment' (assignment type)
   b. To all officers + admins: 'New Incident Reported' (system type)
9. Socket.IO emits:
   a. io.to(reportId).emit('reportUpdated', report)
   b. io.to('role:admin').emit('newReportCreated', report)
   c. io.to('role:officer').emit('newReportCreated', report)
10. 201 response with full report object
```

### 4.2 Case Status Transition Logic

```
Officer/Admin calls PUT /api/reports/update-status/:id
  WITH { status, note, assignedTo, resolutionSummary, finalMessage, paymentAmount }

Decision Tree:
------
A. assignedTo field provided AND differs from current?
    → Reassignment logic (zone check, workload transfer)
    → Timeline entry added
    → Citizen + new officer notified

B. note provided?
    → Push to investigationNotes[]
    → If officer role → notify citizen

C. Status is 'Case Closed' or 'Investigation Completed' or 'Resolved'?
    → SLA breach check: now > slaDeadline?
    → If breached AND role !== 'admin' → 403 LOCK
    → If breached AND role === 'admin' → override logged in timeline

D. status === 'Investigation Completed'?
    → IF paymentStatus already 'Completed' → finalStatus = 'Payment Completed'
    → IF paymentAmount <= 0 → finalStatus = 'Investigation Completed', paymentStatus = 'Not Required'
    → ELSE → finalStatus = 'Payment Pending', paymentStatus = 'Pending'

E. status === 'Case Closed'?
    → If paymentStatus !== 'Completed' AND fines exist → 400 BLOCK
    → Else → report.isClosed = true, closedAt = now
    → officer.assignedReportsCount -= 1

F. Any status change:
    → Timeline entry added (from statusMap)
    → Citizen notified
    → Admin notified if actor is officer
    → System log created
    → System message inserted into Message collection
    → Socket emits 'reportUpdated' to report room
```

### 4.3 SLA Calculation & Monitoring Flow

```
On Report Creation:
  calculateSLA(createdAt, severity) called
  → Config: { Critical: 6hrs 24/7, High: 24hrs biz, Medium: 48hrs biz, Low: 72hrs biz }
  → slaStartTime = createdAt (or next 9AM Monday if outside business hours)
  → slaDeadline = computed by iterating through working-day windows
  → Saved to report: { slaStartTime, slaDeadline, slaStatus: 'ON_TIME' }

Cron Job (every 15 minutes):
  → Find { isClosed: false, slaStatus: { $ne: 'BREACHED' }, slaDeadline: { $lt: now } }
  → For each: slaStatus = 'BREACHED', isSlaBreached = true
  → Timeline entry added: 'SLA BREACHED'
  → Officer notified: 'SLA BREACH ALERT'

On getReportById (lazy check):
  → If slaDeadline < now AND slaStatus !== 'BREACHED' AND !isClosed
  → Immediately mark BREACHED in DB + send notification
```

### 4.4 Payment Flow

```
Investigation Complete → Payment Pending (officer sets fine amount)
  ↓
Citizen views case → Sees fine amount + payment button
  ↓
PUT /api/reports/pay/:id { transactionId }
  ↓
  paymentStatus = 'Completed' / 'Paid'
  paymentDate = now
  transactionId = provided
  Payment record created in Payment collection
  System message + timeline entry added
  ↓
Officer can now transition to 'Case Closed'
```

---

## 5. 🔁 Algorithms & Data Logic

### 5.1 Officer Auto-Assignment (Load-Balanced Round Robin)

- **Algorithm Name:** Zone-Aware Greedy Load Balancer
- **Use Case:** Automatically assigns a new report to the least-loaded active officer in the correct zone
- **Step-by-Step:**
  1. Query officers: `{ role: 'officer', zone: report.zone, isActive: true }`
  2. Sort by `assignedReportsCount: 1` (ascending — least loaded first)
  3. Select `officers[0]` — the officer with fewest active assignments
  4. Increment `officer.assignedReportsCount`
  5. Set `report.assignedTo = officer._id`
- **DB Indexes Used:** `{ zone: 1, assignedReportsCount: 1 }` on both `User` and `Officer` schemas
- **Time Complexity:** O(n log n) for sort (but indexed, so effectively O(log n) at DB level)
- **Space Complexity:** O(n) where n = officers in zone

### 5.2 Geo-Zone Resolution (Ray-Casting)

- **Algorithm Name:** Ray-Casting (Point-in-Polygon)
- **Use Case:** Determine which jurisdictional zone a GPS coordinate falls into
- **Location:** `backend/utils/zoneResolver.js`
- **Step-by-Step:**
  ```
  For each zone (polygon as array of {lat, lng}):
    Cast a ray from point (lat, lng) to the right (→∞)
    Count how many polygon edges the ray crosses
    IF count is odd → point is INSIDE polygon → return this zone
    IF count is even OR 0 → point is OUTSIDE → continue to next zone
  If no zone matches → return null (fallback: 'Central')
  ```
- **Mathematical Basis:** For edge from (xi, yi) to (xj, yj):
  ```
  intersect = ((yi > y) !== (yj > y)) &&
              (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
  if intersect: inside = !inside (XOR toggle)
  ```
- **Time Complexity:** O(n × m) where n = zones, m = polygon vertices per zone. In practice: O(9 × 4) = O(36) — constant time
- **Space Complexity:** O(1)
- **Edge Cases:** Point exactly on boundary → undefined behavior (typically treated as outside; safe for this use case)

### 5.3 SLA Business-Hours Calculation

- **Algorithm Name:** Business Hours Sliding Window
- **Use Case:** Calculate deadline in working hours (09:00–18:00, Mon–Fri), skipping nights/weekends
- **Step-by-Step:**
  ```
  1. Config: { Critical: 6hrs 24/7, High: 24hrs, Medium: 48hrs, Low: 72hrs }
  2. For 24/7 (Critical): slaDeadline = createdAt + 6 hours directly
  3. For business hours:
     a. slaStartTime = createdAt if during working hours
                     = getNextWorkingStartTime(createdAt) otherwise
     b. current = slaStartTime
     c. WHILE remainingHours > 0:
          endOfDay = current + hours until 18:00
          if endOfDay >= remainingHours:
            current += remainingHours → BREAK
          else:
            remainingHours -= hoursUntilEndOfDay
            current = getNextWorkingStartTime(endOfDay) [next 9AM weekday]
     d. slaDeadline = current
  ```
- **Time Complexity:** O(d) where d = working days to deadline (bounded by SLA config, max ~9 iterations for 72hr SLA)
- **Space Complexity:** O(1)

### 5.4 Gemini AI Multi-Key Fallback Strategy

- **Algorithm Name:** Resilient Cascading Retry with Exponential Backoff
- **Use Case:** Maximize AI service uptime across quota limits, model unavailability, and timeouts
- **Model Priority:** `gemini-2.5-flash` → `gemini-1.5-pro` → `gemini-1.5-flash` → `gemini-2.0-flash-exp` → `gemini-pro-vision`
- **Step-by-Step:**
  ```
  FOR each API key (supports comma-separated multi-key from GEMINI_API_KEY env):
    FOR each model in MODELS array:
      delay = 2000ms
      FOR attempt = 1 to 2:
        TRY:
          Set 25s timeout via Promise.race()
          Call model.generateContent([prompt, imagePart])
          IF finishReason === 'SAFETY' → break (try next model)
          Parse JSON from response text via regex /\{[\s\S]*\}/
          RETURN { isValid, detectedThreat, confidence, summary }
        CATCH error:
          IF 429/quota → break (try next model)
          IF 503/504/timeout AND attempt < 2 → delay *= 2, retry
          ELSE → break (try next model)
  RETURN null (all models/keys exhausted)
  ```
- **Confidence Threshold:** `≥ 0.85` → Report auto-verified; `< 0.85` → Stays pending
- **Time Complexity per attempt:** O(1) + network latency (~3–25s)
- **Timeout:** 25,000ms hard limit per attempt

### 5.5 OTP Generation

- **Algorithm:** `Math.floor(100000 + Math.random() * 900000)` → 6-digit numeric string
- **Expiry:** 5 minutes (`Date.now() + 5 * 60 * 1000`)
- **Cleanup:** Old OTPs deleted before new one created (`OTPVerification.deleteMany({ email })`)
- **Time Complexity:** O(1)

### 5.6 Dashboard Aggregation

- **Heavy queries use MongoDB Aggregation Pipeline:**
  ```js
  // Severity distribution
  Report.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }])
  
  // Threat type distribution
  Report.aggregate([{ $group: { _id: "$threatType", count: { $sum: 1 } } }])
  
  // Zone distribution (Citizen Dashboard)
  Report.aggregate([{ $group: { _id: "$zone", count: { $sum: 1 } } }])
  
  // Fines collected
  Report.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    { $group: { _id: null, total: { $sum: "$fineAmount" } } }
  ])
  ```
- **Time Complexity:** O(n) full collection scan (optimized by compound indexes on `status`, `zone`, `assignedTo`, `createdBy`)

### 5.7 Notification Batch Broadcast

- **Algorithm:** Bulk Insert + Socket Room Emission
- **Step-by-Step:**
  ```
  1. User.find({ role: targetRole }) → users[]
  2. Map users[] to notification documents[]
  3. Notification.insertMany(notifications) — single DB round-trip
  4. io.to('role:targetRole').emit('newNotification', payload) — single socket broadcast
  ```
- **Time Complexity:** O(n) for map, O(1) for insertMany (batched) + O(1) for socket broadcast
- **Space Complexity:** O(n) for notification array in memory

---

## 6. 🔧 Function-Level Documentation

### `generateToken(id, role)`
- **File:** `controllers/authController.js`
- **Purpose:** Generate signed JWT for authenticated session
- **Parameters:** `id` (ObjectId), `role` (String)
- **Returns:** JWT string (expires in 30 days)
- **Logic:** `jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' })`

### `protect(req, res, next)`
- **File:** `middleware/authMiddleware.js`
- **Purpose:** Middleware to authenticate all protected routes
- **Parameters:** Express `req`, `res`, `next`
- **Returns:** Calls `next()` on success, or 401/403 JSON response
- **Logic:**
  1. Extract Bearer token from `Authorization` header
  2. `jwt.verify(token, JWT_SECRET)` → decoded `{ id, role }`
  3. `User.findById(decoded.id).select('-password')` → attach to `req.user`
  4. Check `req.user.status !== 'blocked'`
  5. Call `next()`

### `authorize(...roles)`
- **File:** `middleware/authMiddleware.js`
- **Purpose:** RBAC middleware factory — restricts route to specific roles
- **Parameters:** `...roles` (String[])
- **Returns:** Express middleware function
- **Logic:** Normalizes `req.user.role` and allowed roles to lowercase, maps `authority` → `officer`. Returns 403 if role not in allowed list.

### `calculateSLA(createdAt, severity)`
- **File:** `utils/slaCalculator.js`
- **Purpose:** Compute SLA start time and deadline based on severity and business hours
- **Parameters:** `createdAt` (Date), `severity` (String: Low/Medium/High/Critical)
- **Returns:** `{ slaStartTime: Date, slaDeadline: Date }`
- **Pseudocode:**
  ```
  config = getSlaConfiguration(severity)
  if config.is24x7: return { slaStartTime: createdAt, slaDeadline: createdAt + config.hours }
  slaStartTime = isWorkingTime(createdAt) ? createdAt : getNextWorkingStartTime(createdAt)
  current = slaStartTime; remainingHours = config.hours
  while remainingHours > 0:
    endOfDay = current.setHours(18, 0, 0, 0)
    hoursLeft = (endOfDay - current) / 3600000
    if hoursLeft >= remainingHours: current += remainingHours; break
    else: remainingHours -= hoursLeft; current = getNextWorkingStartTime(endOfDay)
  return { slaStartTime, slaDeadline: current }
  ```

### `resolveZone(latitude, longitude, zones)`
- **File:** `utils/zoneResolver.js`
- **Purpose:** Map GPS coordinates to a jurisdictional zone via point-in-polygon
- **Parameters:** `latitude` (Number), `longitude` (Number), `zones` (Zone[])
- **Returns:** Zone object or `null`
- **Logic:** Iterates zones → calls `isInside({ lat, lng }, zone.polygon)` for each → returns first match

### `analyzeThreatImage(imagePath, threatType, description)`
- **File:** `utils/geminiService.js`
- **Purpose:** AI-powered validation of uploaded evidence images
- **Parameters:** `imagePath` (String — absolute path), `threatType` (String), `description` (String)
- **Returns:** `{ isValid: Boolean, detectedThreat: String, confidence: Number, summary: String }` or `null`
- **Pseudocode:**
  ```
  keys = GEMINI_API_KEY.split(',')
  imageData = base64(readFileSync(imagePath))
  for key in keys:
    for model in MODELS:
      for attempt 1..2:
        result = await Promise.race([model.generateContent([prompt, image]), timeout(25s)])
        if success: parse JSON → return { isValid, detectedThreat, confidence, summary }
        if quota/safety: break (next model)
        if timeout/503: exponential backoff → retry
  return null
  ```

### `createNotification({ userId, role, title, message, type, reportId })`
- **File:** `utils/notificationUtils.js`
- **Purpose:** Create and persist a notification record in DB
- **Parameters:** Notification data object
- **Returns:** Saved Notification document
- **Logic:** `Notification.create(data)` → non-blocking (fire-and-forget pattern used in callers)

### `initCronJobs()`
- **File:** `utils/cronJobs.js`
- **Purpose:** Register background scheduled tasks
- **Schedule:** `*/15 * * * *` (every 15 minutes)
- **Logic:** Find non-closed, non-breached reports with past `slaDeadline` → mark BREACHED → notify officer

### `sendEmailOTP(email, otp)`
- **File:** `utils/commService.js`
- **Purpose:** Send OTP via email using Nodemailer (Gmail SMTP) or fall back to console log
- **Parameters:** `email` (String), `otp` (String)
- **Returns:** `{ success: Boolean, mode: 'real' | 'console' | 'error' }`
- **Logic:** Checks for valid SMTP credentials in env → sends styled HTML email → falls back to console in dev

### `loginUser(req, res)`
- **File:** `controllers/authController.js`
- **Purpose:** Authenticate user and respond with JWT
- **Parameters:** `req.body: { email, password }`
- **Returns:** `{ token, _id, id, role, name }` or error JSON
- **Logic:** Email regex → find user → check blocked → check password exists → bcrypt.compare → JWT

### `createReport(req, res)`
- **File:** `controllers/reportController.js`
- **Purpose:** Full report ingestion pipeline (AI + Zone + SLA + Assignment + Notifications)
- **Parameters:** Multipart form: `{ threatTitle, description, threatType, urlOrPhone, severity, latitude, longitude, address, zone }` + optional `evidence` file
- **Returns:** Created/updated report document (201)
- **Internal Logic:** See Business Logic Flow §4.1

### `updateReportStatus(req, res)`
- **File:** `controllers/reportController.js`
- **Purpose:** Handle all case status transitions with guards and notifications
- **Parameters:** `req.params.id`, `req.body: { status, note, assignedTo, resolutionSummary, finalMessage, paymentAmount }`
- **Returns:** Updated report document
- **Internal Logic:** See Business Logic Flow §4.2

---

## 7. ⚠️ Error Handling Strategy

### Client-Side Errors
- API errors caught in `try/catch` or `.catch()` blocks in frontend service files
- User-facing toast/alert messages shown from `response.data.message` (axios interceptors)
- Form validation errors shown inline beneath fields before any API call
- Loading states managed with React `useState` to prevent double-submissions

### Server-Side Errors

| Category | HTTP Status | Response Format |
|---|---|---|
| Validation failure | 400 | `{ message: "descriptive error" }` |
| Authentication failure | 401 | `{ message: "Not authorized, token failed" }` |
| Authorization failure | 403 | `{ message: "403 Forbidden - Access Denied for role: {role}" }` |
| Resource not found | 404 | `{ message: "Report not found" }` |
| Business rule violation | 400/403 | Specific message (e.g., SLA breach locked) |
| Internal server error | 500 | `{ message: error.message }` |
| AI service unavailable | 503 | `{ message: "Image verification temporarily unavailable" }` |

### Database Errors
- Mongoose `CastError` (invalid ObjectId) → pre-validated with `mongoose.Types.ObjectId.isValid()` before queries
- Mongoose `ValidationError` (schema violation) → surfaced as 400 with Mongoose error message
- Duplicate key errors → checked before creation with `findOne()` (users, categories, zones)

### Socket Errors
- All socket handlers wrapped in `try/catch`
- Socket errors logged but do not crash the server — graceful degradation
- API response not blocked if socket emission fails (socket errors are fire-and-forget)

### AI Service Failures
- Multi-level fallback (key rotation → model rotation → exponential backoff)
- If ALL models and keys fail → returns `null` → report saved in Pending state for manual review
- Never blocks report submission — "Visibility-First Persistence" protocol ensures report is saved to DB before AI analysis begins

### Port Conflict Handling (Server Startup)
```js
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is occupied`);
    process.exit(1); // Graceful exit with instructions
  }
})
```

---

## 8. 🧪 Edge Case Handling

| Scenario | Handling Strategy |
|---|---|
| Report submitted outside working hours | SLA start time advanced to next 9AM Monday–Friday |
| GPS coordinates outside all defined zones | Fallback to `'Central'` zone |
| No officers available in the report's zone | Report stays `'Pending'`; no assignment attempted |
| AI service fully down (all keys/models fail) | Report saved as `Pending` for manual review; no 500 error to user |
| AI confidence < 0.85 | Report kept as `Pending`; not auto-verified |
| Evidence image flagged by Gemini safety filter | Rotates to next model; not treated as rejection |
| Citizen attempts Case Closed with unpaid fine | 400 validation error: "Payment must be completed first" |
| Officer attempts to resolve SLA-breached case | 403 locked: "Escalate for Admin Override" |
| Admin resolves SLA-breached case | Allowed with timeline override entry logged |
| Cross-zone manual reassignment | Allowed only if `assignment_type: 'manual'`; blocked for automatic |
| Google OAuth user tries password login | 401: "This account uses Google Login" |
| Officer tries to use Google OAuth | 403: "Officers must use Email & Password" |
| Deleting admin account | 403: "Cannot delete admin account" |
| Blocking admin account | 403: "Cannot block admin account" |
| Expired OTP used | 400: "Invalid or expired OTP" |
| Reopen already-open case | Controlled by `reopenAttempts` counter |
| Duplicate category/zone creation | 400: "Already exists" pre-checked |
| Invalid MongoDB ObjectId in URL | 400: "Invalid ID format" — avoids CastError crash |
| Socket message from non-participant | Silently dropped (no error to client) |
| File upload of unsupported type | Multer rejects before controller: "Images and PDFs only!" |
| Concurrent SLA check (cron + lazy) | Cron checks `slaStatus: { $ne: 'BREACHED' }` — idempotent |
| Empty notification broadcast | `users.length > 0` guard before `insertMany()` |

---

## 9. 🔐 Security & Best Practices

### Authentication Flow
- JWT issued on login/register with `{ id, role }` payload; signed with `JWT_SECRET` from env
- **Token Expiry:** 30 days (long-lived; designed for civic use — no refresh token mechanism currently)
- **Storage recommendation:** `localStorage` (current), `httpOnly cookies` (recommended for production)
- All protected routes require `Authorization: Bearer <token>` header

### Password Hashing
- Library: `bcryptjs`
- Salt rounds: 10 (`bcrypt.genSalt(10)`)
- Hashing is automatic via Mongoose `pre('save')` hook on `User` model
- Password never returned in any response (`.select('-password')` used on all user queries)

### Token Management
- JWT verified on every protected request via `authMiddleware.protect`
- User re-fetched from DB on each request (ensures blocked users are denied even with valid tokens)
- New token issued on profile update (`updateMe`) to reflect updated user data

### Secure APIs
- All mutation endpoints (`POST`, `PUT`, `DELETE`, `PATCH`) require authentication
- Role authorization enforced at route level before controller execution
- `express.json()` limits parsing to JSON content type

### HTTPS Enforcement
- Not configured in codebase (handled at reverse proxy/deployment level — Nginx/Cloudflare)
- **Production requirement:** TLS/SSL termination at infrastructure layer

### Data Protection
- Passwords hashed with bcrypt (irreversible)
- Google OAuth users have `password: null` stored (no guessable password)
- OTPs stored in separate `OTPVerification` collection with TTL and cleaned after use
- Location data (lat/lng/address) hidden from unauthorized viewers in `getReportById`
- Avatar stored on server filesystem with UID-prefixed filename to prevent enumeration

### Environment Variables (`.env`)
```
PORT=5000
MONGO_URI=<mongodb connection string>
JWT_SECRET=<strong random secret>
GEMINI_API_KEY=<key1,key2,...>
GOOGLE_CLIENT_ID=<oauth client id>
EMAIL_SERVICE=gmail
EMAIL_USER=<smtp email>
EMAIL_PASS=<app password>
FAST2SMS_API_KEY=<sms api key>
```

---

## 10. ⚡ Performance Optimization

### Database Indexing
Indexes defined directly in Mongoose schemas:

| Collection | Indexes |
|---|---|
| `Report` | `{ createdBy: 1, createdAt: -1 }`, `{ assignedTo: 1, createdAt: -1 }`, `{ status: 1 }`, `{ zone: 1 }` |
| `User` | `{ zone: 1, assignedReportsCount: 1 }` — powers officer auto-assignment |
| `Officer` | Same compound index as User (same collection) |
| `AuditLog` | `{ entityId: 1 }`, `{ userId: 1 }` |
| `Message` | `{ reportId: 1, createdAt: 1 }` — powers chronological chat loading |

### API Optimization
- **Populated fields limited:** Only `name` and `email` populated from referenced documents (no full documents)
- **Field selection:** `select('-password')` excludes sensitive fields
- **Notification fetch limit:** `limit(50)` — prevents unbounded notification queries
- **Audit log limit:** `limit(100)` — prevents full-collection audit log scans

### Caching
- **`Cache-Control: no-store`** applied globally — intentional anti-cache for sensitive civic data
- No Redis caching currently implemented (recommended for dashboard stats in production)

### Real-Time vs. Polling
- **Socket.IO used** for all live updates — eliminates polling overhead
- Dashboard updates, chat messages, notifications all pushed via WebSocket
- **Rooms strategy:** `userId` (personal), `role:{role}` (broadcast), `reportId` (investigation chat) — targeted emission avoids broadcasting to unnecessary clients

### File Handling
- **Disk storage (Multer)** — files saved directly to disk instead of memory buffers, preventing memory spikes on large uploads
- Evidence images converted to **base64 string** for Gemini API inline data (bounded by file size)

### Frontend (Vite + React)
- **Vite** used across all 3 frontend apps — fast HMR, tree-shaking, code splitting built-in
- **React Context API** used for auth state, notification state — avoids Redux overhead
- **Lazy routing** recommended (can be implemented with `React.lazy()` + `Suspense`)
- **Debouncing** recommended for search inputs on Reports/Users pages

### Background Jobs
- **SLA monitor cron** runs every 15 minutes (`node-cron`) — offloads SLA breach detection from request cycle
- All notifications dispatched **asynchronously** (fire-and-forget) — does not block primary response

---

## 11. 📊 Database Schema, API Endpoints & Architecture

### 11.1 Database Schema Overview

#### `users` Collection (shared by User + Officer models)
| Field | Type | Constraints |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required, Unique |
| `password` | String | Optional (null for Google users) |
| `phone` | String | Optional |
| `role` | String | Enum: admin/officer/citizen; default: citizen |
| `status` | String | Enum: active/verified/blocked/inactive; default: active |
| `zone` | String | Enum: 9 directional zones |
| `isActive` | Boolean | Default: true |
| `assignedReportsCount` | Number | Default: 0 |
| `avatar` | String | URL path; default: '' |
| `otp` | String | Temporary OTP storage |
| `otpExpiry` | Date | OTP expiration |

#### `reports` Collection
| Field | Type | Constraints |
|---|---|---|
| `threatTitle` | String | Required |
| `threatType` | String | Required, Enum (10 values) |
| `description` | String | Required |
| `urlOrPhone` | String | Optional |
| `evidenceURL` | String | Optional (file path or URL) |
| `severity` | String | Required, Enum: Low/Medium/High/Critical |
| `status` | String | Enum (13 states), default: Pending |
| `fineAmount` | Number | Default: 0 |
| `paymentStatus` | String | Enum: Not Required/Pending/Completed/Paid |
| `paymentAmount` | Number | Default: 0 |
| `isClosed` | Boolean | Default: false |
| `paymentDate` | Date | Optional |
| `transactionId` | String | Optional |
| `ipAddress` | String | Auto-captured |
| `latitude` | Number | Optional |
| `longitude` | Number | Optional |
| `address` | String | Optional |
| `zone` | String | Required, Enum (9 zones) |
| `createdBy` | ObjectId → User | Required |
| `assignedTo` | ObjectId → Officer | Optional |
| `assigned_officer_id` | ObjectId → Officer | Optional (duplicate for manual assignments) |
| `assignment_type` | String | Enum: automatic/manual; default: automatic |
| `reassigned_by` | ObjectId → User | Optional |
| `reassigned_at` | Date | Optional |
| `investigationNotes` | Array [{note, addedBy, createdAt}] | Embedded |
| `timeline` | Array [{title, description, role, timestamp}] | Embedded |
| `evidence` | Array [{type, url, content, addedAt}] | Embedded |
| `resolution` | Object {summary, date, officerName, finalMessage} | Embedded |
| `aiMetadata` | Object {isValid, confidence, detectedThreat, extractedText, summary, aiStatus} | Embedded |
| `reopenAttempts` | Number | Default: 0 |
| `closedAt` | Date | Optional |
| `slaDeadline` | Date | Optional |
| `slaStartTime` | Date | Optional |
| `slaStatus` | String | Enum: ON_TIME/BREACHED; default: ON_TIME |
| `isSlaBreached` | Boolean | Default: false |

#### `notifications` Collection
| Field | Type | Constraints |
|---|---|---|
| `userId` | ObjectId → User | Required |
| `role` | String | Enum: citizen/officer/admin; Required |
| `title` | String | Required |
| `message` | String | Required |
| `type` | String | Enum: system/warning/update/assignment; Required |
| `read` | Boolean | Default: false |
| `reportId` | ObjectId → Report | Optional |

#### `messages` Collection
| Field | Type | Constraints |
|---|---|---|
| `reportId` | ObjectId → Report | Required |
| `senderId` | ObjectId → User | Optional |
| `receiverId` | ObjectId → User | Optional |
| `senderRole` | String | Enum: citizen/officer/system; Required |
| `message` | String | Optional |
| `fileUrl` | String | Optional |
| `fileName` | String | Optional |
| `messageType` | String | Enum: text/image/file; default: text |
| `status` | String | Enum: sent/delivered/seen; default: sent |

#### `zones` Collection
| Field | Type | Constraints |
|---|---|---|
| `name` | String | Required, Unique |
| `code` | String | Optional (CZ, NZ, SZ, etc.) |
| `description` | String | Optional |
| `polygon` | Array [{lat, lng}] | Polygon boundary coordinates |

#### `otpverifications` Collection
| Field | Type | Description |
|---|---|---|
| `email` | String | User's email |
| `phone` | String | User's phone |
| `otp` | String | 6-digit code |
| `expires_at` | Date | 5-minute TTL |

#### `payments` Collection
| Field | Type | Constraints |
|---|---|---|
| `reportId` | ObjectId → Report | Required |
| `citizenId` | ObjectId → User | Required |
| `category` | String | Required |
| `amount` | Number | Required |
| `status` | String | Enum: Pending/Paid; default: Pending |
| `transactionId` | String | Optional |
| `paymentDate` | Date | Optional |

#### `auditlogs` Collection
| Field | Type | Constraints |
|---|---|---|
| `userId` | ObjectId → User | Required |
| `action` | String | Required |
| `entity` | String | Enum: User/Report/Message/System |
| `entityId` | ObjectId | Optional |
| `details` | Object | Free-form metadata |
| `ipAddress` | String | Optional |
| `severity` | String | Enum: info/warning/critical; default: info |

---

### 11.2 API Endpoint Summary

#### Auth Routes — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Citizen self-registration |
| POST | `/login` | Public | Email/password login (all roles) |
| POST | `/google` | Public | Google OAuth login (citizens only) |
| POST | `/forgot-password` | Public | Send OTP to email |
| POST | `/verify-reset-otp` | Public | Verify OTP |
| POST | `/reset-password` | Public | Reset password with valid OTP |
| GET | `/me` | Protected | Get current user profile |
| PUT | `/profile` | Protected | Update profile + avatar |

#### Report Routes — `/api/reports`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/create` | Citizen | Submit new report (with optional evidence file) |
| POST | `/analyze-evidence` | Citizen | Pre-scan evidence image via AI |
| GET | `/citizen/:id` | Citizen/Admin | Get reports by citizen |
| GET | `/officer/:id` | Officer/Admin | Get reports assigned to officer |
| GET | `/all` | Admin/Officer | Get all reports |
| GET | `/:id` | Protected | Get report by ID (with location access control) |
| GET | `/:id/timeline` | Protected | Get report timeline |
| GET | `/:id/evidence` | Protected | Get evidence attachments |
| GET | `/:id/pdf` | Protected | Download PDF report |
| PUT | `/update-status/:id` | Officer/Admin | Update status/assignment/notes |
| PUT | `/reopen/:id` | Citizen | Request case reopen |
| PUT | `/edit/:id` | Admin | Edit report fields |
| PUT | `/pay/:id` | Citizen | Submit payment for fine |
| PUT | `/:id/extend-sla` | Admin | Extend SLA deadline |
| PUT | `/:id/escalate` | Officer | Escalate report |
| POST | `/:id/notes` | Officer/Admin | Add investigation note |
| POST | `/:id/evidence` | Officer/Admin | Add evidence file/link |
| PUT | `/:id/timeline` | Officer/Admin | Add manual timeline entry |
| DELETE | `/:id` | Admin | Delete report |

#### Admin Routes — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | All users |
| POST | `/officer/add` | Add officer |
| PUT | `/user/:id` | Update user |
| DELETE | `/user/:id` | Delete user |
| PATCH | `/user-status/:id` | Toggle block/active |
| POST | `/category/add` | Add category |
| DELETE | `/report/:id` | Delete report |
| GET | `/audit-logs` | Get audit logs |
| GET | `/zones` | Get all zones |
| POST | `/zones` | Add zone |

#### Dashboard Routes — `/api/dashboard`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin-stats` | Admin | Full analytics + charts |
| GET | `/officer-stats/:id` | Officer | Officer-specific case stats |
| GET | `/citizen-stats/:id` | Citizen | Personal report stats + zone/threat charts |

#### Notification Routes — `/api/notifications`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/send` | Send/broadcast notification |
| GET | `/user/:id` | Get notifications for user |
| PATCH | `/mark-read/:id` | Mark single notification read |
| PATCH | `/mark-all-read/:id` | Mark all read |
| GET | `/unread-count/:id` | Get unread count |

#### Other Routes
| Prefix | Module |
|---|---|
| `/api/messages` | Case chat messages |
| `/api/zones` | Zone read/query |
| `/api/system-logs` | System log access |
| `/api/collaboration` | Cross-officer collaboration features |
| `/api/users` | User utility endpoints |

---

### 11.3 System Architecture Summary

```
                        FRONTEND LAYER
  +------------------+  +-------------------+  +--------------+
  |  Citizen Panel   |  |   Officer Panel   |  | Admin Panel  |
  |   (Port 5174)    |  |   (Port 5175)     |  | (Port 5173)  |
  |  React + Vite    |  |  React + Vite     |  | React + Vite |
  +--------+---------+  +---------+---------+  +------+-------+
           |      HTTP (Axios)    |                   |
           |      WebSocket (Socket.IO)               |
           v                     v                   v
  +-------------------------------------------------------------------+
  |                      BACKEND (Port 5000)                         |
  |                   Node.js + Express.js v5                        |
  |                                                                   |
  |  Routes → Middleware (protect/authorize/multer) → Controllers     |
  |  authController | reportController | adminController             |
  |  dashboardController | notificationController                     |
  |                                                                   |
  |  Socket.IO Server                                                 |
  |  Rooms: userId | role:{role} | reportId                          |
  |                                                                   |
  |  Utilities: geminiService | slaCalculator | zoneResolver          |
  |             commService | cronJobs | notificationUtils            |
  +-----------------------------+-------------------------------------+
                                |  Mongoose ODM
                                v
  +-------------------------------------------------------------------+
  |                      MongoDB Database                            |
  |  users · reports · notifications · messages · zones              |
  |  payments · auditlogs · systemlogs · otpverifications            |
  +-------------------------------------------------------------------+
                                |
                                v
  +-------------------------------------------------------------------+
  |                     External Services                            |
  |  Google Gemini AI | Gmail SMTP | Google OAuth | Fast2SMS/Twilio  |
  +-------------------------------------------------------------------+
```

### 11.4 Frontend Panel Structure (All 3 Panels)

All three panels share identical folder architecture:
```
src/
  App.jsx              # Root component + route definitions
  main.jsx             # ReactDOM.render + provider wrapping
  index.css            # Global design system
  pages/               # Full-page route components
  components/          # Reusable UI components
    reusable/          # Shared across pages (DashboardCard, etc.)
  context/             # React Context (Auth, Notification)
  layouts/             # Layout wrappers (Sidebar, Navbar)
  routes/              # Route configuration files
  routing/             # Protected route HOCs
  services/            # Axios API service functions
```

### 11.5 Report Status State Diagram

```
          Submit      +---------+
         -----------> | Pending |
                      +----+----+
                           | AI Verified (>=85%)
                      +----v----+
                      |Verified |
                      +----+----+
                           | Officer Auto-Assigned
                      +----v----+
                      |Assigned |<---------------------------------+
                      +----+----+                                  |
                           | Officer begins investigation          | Reopen
                      +----v-----------+                           |
                      | Investigating  |                           |
                      +----+-----------+                           |
                           |                                       |
              +------------v-----------+                           |
              | Investigation Completed|                           |
              +----+---------------+---+                           |
                   |               |                               |
          Fine > 0 |               | Fine = 0                      |
                   v               v                               |
          +-----------+       +-----------+                        |
          | Payment   |       |   Case    |                        |
          | Pending   |       |   Closed  +------------------------+
          +-----+-----+       +-----------+  Citizen Reopens
                | Paid
                v
       +-----------------+
       | Payment Completed|
       +--------+--------+
                | Officer confirms
                v
           +---------+
           |  Case   |
           |  Closed |
           +---------+

       +----------+
       | Rejected | <- AI rejection OR officer decision
       +----------+
```

---

*This document is auto-generated from live codebase analysis and serves as the definitive technical reference for the CyberGuard platform.*

*Last Updated: April 2026 | CyberGuard Engineering Team*
