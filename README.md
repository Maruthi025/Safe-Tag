# Safe Tag — QR-Based Lost-and-Found Management Platform

Safe Tag is a responsive full-stack lost-and-found web application designed around a **single universal QR code**. Every sticker shares the identical QR code pointing to the platform's public landing page.

---

## 🎯 Core Concept & Client Constraint
- **One QR Code Everywhere:** All physical stickers carry the exact same QR code pointing to the website URL. No unique item QR codes are generated.
- **Smart Heuristic Matching:** Since scanning the sticker does not automatically identify the physical item, the backend matching service pairs finder-submitted details against registered lost items.
- **Two Distinct Portals:**
  - **Admin (Owner Portal):** Register belongings, declare lost items, review potential matches, confirm ownership, and track recovery.
  - **Finder Portal:** Submit found items and contact info in under 2 minutes with zero account creation required, plus optional GPS location sharing.

---

## 🚀 Tech Stack
- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, React Hook Form, Zod, Lucide React, Axios.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT (HttpOnly cookies), bcryptjs, express-rate-limit, express-validator, qrcode.
- **Security:** Helmet, NoSQL sanitization, strict CORS, rate limiting, and private location storage.

---

## 📂 Project Structure
```text
Client/
├── client/                 # React 18 + Vite frontend
│   ├── public/             # Static assets & favicon
│   ├── src/
│   │   ├── components/     # Layouts (Navbar, Footer, AdminLayout) & Shared UI
│   │   ├── features/       # Auth guards & feature components
│   │   ├── pages/          # Public, Auth, Finder, and Admin pages
│   │   ├── services/       # Axios API client
│   │   ├── store/          # AuthContext & NotificationContext
│   │   ├── App.jsx         # App router
│   │   └── main.jsx        # App entry point
│   ├── .env.example
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database, email & constants
│   │   ├── controllers/    # Auth, Item, LostReport, FoundReport, Match, Notification, QR
│   │   ├── middleware/     # Auth, error handling, rate limiting, validation
│   │   ├── models/         # User, Item, LostReport, FoundReport, Match, Notification
│   │   ├── routes/         # REST API routes
│   │   ├── services/       # Heuristic matching service
│   │   ├── utils/          # AppError, reference generator
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # Server listener
│   ├── tests/              # Jest / Supertest test suites
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🛠️ Local Setup Instructions

### 1. Prerequisites
- **Node.js** v18+ (tested with v24 LTS)
- **MongoDB** (Local instance or free MongoDB Atlas URI)

### 2. Configure Environment Variables

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/safetag
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_signing_secret_here
CLIENT_ORIGIN=http://localhost:5173
PUBLIC_WEBSITE_URL=http://localhost:5173

# Optional: Email Notifications (gracefully skips if not provided)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=Safe Tag <noreply@safetag.com>
```

#### Frontend (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_PUBLIC_WEBSITE_URL=http://localhost:5173
```

---

### 3. Install Dependencies & Start

#### Backend Terminal:
```powershell
cd server
npm.cmd install
npm.cmd run dev
```

#### Frontend Terminal (in a separate window):
```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🧪 Running Tests

### Backend Tests:
```powershell
cd server
npm.cmd test
```

---

## 🖨️ How to Print the Master QR Stickers
1. Start the application and log into the **Admin Portal**.
2. Navigate to the **QR Code** page in the sidebar (`/admin/qr`).
3. Click **Download Sticker PNG** or **Print Sticker Sheet**.
4. Print the QR on label sheets or stickers.
5. Every single printed sticker will link to your configured domain where any finder can report a found belonging!
