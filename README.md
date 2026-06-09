# HopCare — AI Healthcare Platform

A full-stack AI-powered healthcare web application for patients, doctors, and admins. Built as a college project.

🌐 **Live Demo:** [hopcare.me](https://hopcare.me)

---

## Features

**Patients**
- Register / Login with OTP email verification (2FA)
- Book appointments with online payment (Razorpay)
- AI Symptom Checker powered by Google Gemini
- Video consultation (Jitsi)
- In-app chat with doctor
- Upload medical documents when booking
- Rate and review doctors
- Medical history timeline with PDF prescription download
- Real-time notifications
- Dark mode

**Doctors**
- Manage appointment requests (confirm / complete / cancel)
- View patient documents and medical notes
- Write prescriptions
- In-app chat with patient
- Queue management

**Admin**
- System-wide stats (patients, doctors, appointments)
- View all appointments and users
- Direct login (no OTP)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool (dev server on port 3000) |
| Tailwind CSS (CDN) | Styling |
| React Router DOM v7 | Client-side routing (HashRouter) |
| Lucide React | Icons |
| jsPDF | Prescription PDF generation |
| @jitsi/react-sdk | Video consultation |
| @google/genai | Gemini AI symptom analysis |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication tokens |
| bcrypt | Password hashing |

### Cloud Services
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |
| Brevo | OTP email delivery |
| Razorpay | Payment gateway (test mode) |
| Google Gemini API | AI symptom analysis |
| Jitsi | Video conferencing |

---

## Project Structure

```
/
├── backend/
│   ├── models/          # Mongoose schemas (Patient, Doctor, Appointment, etc.)
│   ├── server.js        # Express server + all API routes
│   ├── package.json
│   └── .env             # Environment variables (not committed)
├── pages/               # React pages (PatientDashboard, DoctorDashboard, AdminDashboard, etc.)
├── components/          # Reusable components (Layout, ChatModal, NotificationBell, etc.)
├── context/             # AuthContext, ThemeContext
├── services/
│   └── api.ts           # All frontend API calls
├── types.ts             # TypeScript types and enums
├── App.tsx              # Routes
├── index.html           # Entry point + Tailwind CDN
├── vite.config.ts
└── start.bat            # One-click local startup script
```

---

## Running Locally

### Prerequisites
- Node.js installed
- MongoDB Compass (local MongoDB) installed and running

### Quick Start (Windows)
Double-click `start.bat` — it opens both backend and frontend in separate terminal windows.

### Manual Start

**Terminal 1 — Backend**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 — Frontend**
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **OTP locally:** Brevo email is blocked on local IPs. The OTP is printed directly in the backend terminal window — copy it from there.

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hopcare
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
ADMIN_SETUP_SECRET=your_admin_secret
```

### Frontend (Vercel environment variables)
```
VITE_API_URL=https://your-backend.onrender.com/api
GEMINI_API_KEY=your_gemini_api_key
```

---

## Creating Admin Account (One-Time Setup)

After deploying, call this endpoint once:

```bash
POST /api/admin/setup
Body: {
  "secret": "<ADMIN_SETUP_SECRET>",
  "name": "Admin",
  "email": "admin@yourdomain.com",
  "password": "YourPassword"
}
```

Admin login bypasses OTP and issues a JWT directly.

---

## Authentication Flow

```
Patient/Doctor login:
  Enter password → OTP sent via Brevo email → Enter OTP → JWT issued

Admin login:
  Enter password → JWT issued directly (no OTP)
```

---

## Database Collections

| Collection | Description |
|---|---|
| patients | Patient and Admin accounts |
| doctors | Doctor profiles with availability |
| appointments | All bookings |
| notifications | Per-user notifications |
| reviews | Doctor ratings and comments |
| messages | In-app chat per appointment |
