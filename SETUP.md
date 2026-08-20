# CyberGuard – Setup Instructions

This system consists of 3 separate React frontend applications and a unified Node.js backend.

## 🚀 Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas)

## 🛠 Project Structure
- `/backend`: Express.js API
- `/frontend-admin`: Admin Panel (`admin@cyber.com`)
- `/frontend-authority`: Authority Panel (`authority@cyber.com`)
- `/frontend-citizen`: Citizen Portal (Registered users)

## 📡 Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Create `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start backend: `npm start` (or `npm run dev`)

## 💻 Frontend Setup (Repeat for all 3 folders)
1. Navigate to the frontend folder (e.g., `frontend-admin/`)
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## 🔐 Role Access
- **Admin**: Login with `admin@cyber.com` (password: `admin123` if seeded, or register a user and change role in DB).
- **Authority**: Login with `authority@cyber.com`.
- **Citizen**: Register via the Citizen Portal.

## 🎨 UI Style Guide
- All panels share the same Vanilla CSS design system in `src/index.css`.
- Components are shared but localized in each `src/components` folder.
- Dynamic sidebars and stats are role-specific.
