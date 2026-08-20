# CyberGuard Project Specifications - Data Architecture & Tech Stack

This document outlines the core architecture, technology stack, and data dictionary (table structures) for the CyberGuard MERN-based incident reporting and monitoring platform.

---

## 🏗️ Technology Stack

### 💻 Frontend (Client Panels: Citizen, Officer, Admin)
- **Framework**: React.js 18+ (Vite)
- **Styling**: Vanilla CSS (Premium Micro-animations) & TailwindCSS
- **State Management**: React Context API
- **Icons**: Lucide-React
- **Mapping**: Leaflet + OpenStreetMap (OSM)
- **Communication**: Socket.io-client (Real-time status updates & chat)

### ⚙️ Backend (API Layer)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JSON Web Token (JWT) with Passport-style Middleware
- **Security**: bcryptjs (Password Hashing)
- **Real-time**: Socket.io

### 🗄️ Database (Persistence Layer)
- **Engine**: MongoDB
- **ODM**: Mongoose
- **Deployment**: Local Instance (localhost:27017/cyber_threat_db)

---

## 📊 Data Dictionary (Collection Structures)

### 1. `User` (Collection: `users`)
| Field | Type | Description | Key Specs |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key (System generated) | Unique |
| `name` | String | User's full name | Required |
| `email` | String | Login email address | Required, Unique |
| `password` | String | Hashed password | bcrypt hashed |
| `phone` | String | Mobile number | Required |
| `role` | String | System access level | enum: ['admin', 'officer', 'citizen'] |
| `status` | String | Account state | default: 'active' |
| `zone` | String | Jurisdictional area (for Officers) | enum: ['Central', 'North', 'South', etc.] |
| `assignedReportsCount` | Number | Active workload counter | default: 0 |

### 2. `Report` (Collection: `reports`)
| Field | Type | Description | Key Specs |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Incident Tracking Identifier | Unique |
| `threatTitle` | String | Brief title of the incident | Required |
| `threatType` | String | Categorized cyber threat | enum: ['Phishing Attack', 'Malware', etc.] |
| `severity` | String | Priority level | enum: ['Low', 'Medium', 'High', 'Critical'] |
| `status` | String | Current investigation stage | enum: ['Pending', 'Assigned', 'Resolved', etc.] |
| `description` | String | Full detail of the attack | Required |
| `latitude` / `longitude` | Number | GPS Coordinates | Captured via Geolocation API |
| `address` | String | Localized physical address | OSM reverse-geocoded |
| `fineAmount` | Number | Standard penalty amount | Fixed via Backend Mapping |
| `paymentStatus` | String | Fine status | enum: ['Not Required', 'Pending', 'Paid'] |
| `createdBy` | ObjectId | Citizen reporter | Ref: `User` |
| `assignedTo` | ObjectId | Investigating Officer | Ref: `User` |
| `timeline` | Array | Audit log of all status shifts | [{title, description, timestamp}] |

### 3. `Message` (Collection: `messages`)
| Field | Type | Description | Key Specs |
| :--- | :--- | :--- | :--- |
| `reportId` | ObjectId | Associated Incident | Ref: `Report` |
| `senderId` | ObjectId | User Sending Message | Ref: `User` (Null for system) |
| `senderRole` | String | Identity verification | enum: ['citizen', 'officer', 'system'] |
| `message` | String | Chat content or system text | Required |

### 4. `Payment` (Collection: `payments`)
| Field | Type | Description | Key Specs |
| :--- | :--- | :--- | :--- |
| `reportId` | ObjectId | Source Case | Ref: `Report` |
| `citizenId` | ObjectId | Paying Entity | Ref: `User` |
| `amount` | Number | Final Amount Paid (INR) | Required |
| `transactionId` | String | Gateway reference code | Generated: "TXN-XXXX" |
| `status` | String | Record status | enum: ['Pending', 'Paid'] |

### 5. `Notification` (Collection: `notifications`)
| Field | Type | Description | Key Specs |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId | Target recipient | Ref: `User` |
| `title` | String | Short header | Required |
| `message` | String | Notification body | Required |
| `type` | String | Alert category | enum: ['system', 'warning', 'update', 'assignment'] |
| `read` | Boolean | Read status | default: false |

### 6. `SystemLog` (Collection: `systemlogs`)
| Field | Type | Description | Key Specs |
| :--- | :--- | :--- | :--- |
| `level` | String | Log severity | enum: ['info', 'warn', 'error', 'critical'] |
| `category` | String | Operation type | e.g., 'REPORT', 'AUTH', 'SYSTEM' |
| `message` | String | Event description | Required |
| `metadata` | Object | Debugging parameters | Optional JSON |

---
*Documentation generated for project auditing and development mapping.*
