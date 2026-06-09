# HopCare — Viva Notes

## Project Overview
HopCare is an AI-powered healthcare web application that allows patients to book doctor appointments, consult online, and get AI-based symptom analysis. It has three user roles: Patient, Doctor, and Admin.

---

## Frontend Technologies

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI library for building components |
| **TypeScript** | 5.8 | Strongly typed JavaScript |
| **Vite** | 6.2 | Build tool and dev server (runs on port 3000) |
| **Tailwind CSS** | 3 (CDN) | Utility-first CSS framework for styling |
| **React Router DOM** | 7 | Client-side routing (HashRouter) |
| **Lucide React** | 0.562 | Icon library |
| **jsPDF** | 4.2 | PDF generation for prescriptions |
| **@jitsi/react-sdk** | 1.4 | Video consultation integration |
| **@google/genai** | 1.34 | Google Gemini AI SDK |

---

## Backend Technologies

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for backend server |
| **Express.js** | Web framework for REST API |
| **MongoDB** | NoSQL database to store all data |
| **Mongoose** | MongoDB ODM (Object Document Mapper) |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **CORS** | Cross-Origin Resource Sharing middleware |
| **dotenv** | Environment variable management |

---

## Cloud Services Used

| Service | Purpose | URL |
|---|---|---|
| **Vercel** | Frontend hosting/deployment | hopcare.me |
| **Render** | Backend server hosting (free tier) | onrender.com |
| **MongoDB Atlas** | Cloud database (free tier) | mongodb.com |
| **Brevo** | Transactional email for OTP delivery | brevo.com |
| **Razorpay** | Payment gateway (test mode) | razorpay.com |
| **Google Gemini API** | AI symptom analysis | ai.google.dev |
| **Jitsi** | Free video conferencing for consultations | jitsi.org |
| **GitHub** | Version control and source code | github.com |

---

## Database — MongoDB Collections

| Collection | Purpose |
|---|---|
| **patients** | Patient and Admin accounts |
| **doctors** | Doctor accounts with specialization, availability |
| **appointments** | All appointment records |
| **notifications** | In-app notifications per user |
| **reviews** | Doctor ratings and comments |
| **messages** | In-app chat messages per appointment |

---

## Key Features Implemented

| Feature | How It Works |
|---|---|
| **OTP Login** | User enters password → OTP sent via Brevo email → verified before JWT issued |
| **Admin Login** | Bypasses OTP — JWT issued directly on password match |
| **AI Symptom Checker** | User types symptoms → sent to Google Gemini API → returns prediction, confidence, specialist recommendation |
| **Appointment Booking** | Patient selects doctor + slot → Razorpay payment → appointment saved to MongoDB |
| **Video Consultation** | Jitsi SDK creates a meeting room per appointment ID |
| **In-App Chat** | Patient and Doctor exchange messages per appointment — polls every 3 seconds |
| **Doctor Reviews** | Patient rates doctor (1-5 stars) after completed appointment — doctor average updated |
| **Medical History** | Timeline of all completed appointments with prescriptions downloadable as PDF |
| **Dark Mode** | Saved in localStorage — applies `.dark` class to `<html>` element |
| **Notifications** | Created on appointment status changes — polling every 5 seconds |
| **Document Upload** | Patient uploads reports when booking — stored as base64 in MongoDB |
| **Admin Dashboard** | View system stats, all appointments, all users (patients + doctors) |

---

## Architecture

```
Browser (React + Vite)
        ↓ HTTPS
Vercel (hopcare.me)
        ↓ REST API calls
Render (Node.js + Express — port 5000)
        ↓
MongoDB Atlas (cloud database)
```

---

## Authentication Flow

```
1. User enters email + password
2. Backend verifies password with bcrypt
3a. Admin → JWT issued immediately (no OTP)
3b. Patient/Doctor → 6-digit OTP generated
4. OTP sent via Brevo email API
5. User enters OTP
6. Backend verifies OTP → issues JWT
7. JWT stored in localStorage
8. All API calls send JWT in Authorization header
```

---

## Environment Variables

### Backend (Render)
```
MONGO_URI         = MongoDB Atlas connection string
JWT_SECRET        = Secret key for signing tokens
BREVO_API_KEY     = Brevo email API key
RAZORPAY_KEY_ID   = Razorpay test key ID
RAZORPAY_KEY_SECRET = Razorpay test secret
ADMIN_SETUP_SECRET = One-time secret to create admin account
```

### Frontend (Vercel)
```
VITE_API_URL      = Backend Render URL
GEMINI_API_KEY    = Google Gemini API key
```

---

## Possible Viva Questions

**Q: Why did you use React instead of plain HTML/JS?**
A: React allows component reuse, efficient DOM updates via Virtual DOM, and state management — making it suitable for a dynamic app with real-time updates.

**Q: What is JWT and why did you use it?**
A: JSON Web Token — a compact, self-contained token that carries user identity. Used because it is stateless (no session storage needed on server), scalable, and secure when signed with a secret key.

**Q: Why MongoDB instead of SQL?**
A: MongoDB is schema-flexible, making it easy to add new fields (like documents, reviews, messages) without database migrations. Also pairs well with Node.js via Mongoose.

**Q: What is OTP and why is it used?**
A: One-Time Password — a 6-digit code sent to the user's email that expires in 10 minutes. Adds a second layer of security (2FA) so even if the password is stolen, the account is protected.

**Q: How does the AI Symptom Checker work?**
A: The user's symptoms are sent to Google Gemini API with a prompt asking for a predicted condition, confidence percentage, specialist recommendation, and urgency level. The response is parsed and displayed.

**Q: What is the difference between Vercel and Render?**
A: Vercel hosts the static frontend files (HTML, CSS, JS) built by Vite. Render hosts the Node.js backend server that runs continuously and handles API requests and database operations.

**Q: Why HashRouter instead of BrowserRouter?**
A: Vercel serves a single-page app — with BrowserRouter, refreshing a page like `/dashboard` would return a 404. HashRouter uses `#` in the URL (e.g. `/#/dashboard`) which always loads `index.html` first, then React handles the routing.

**Q: How is payment handled?**
A: Razorpay payment gateway (test mode). The backend creates an order, the frontend opens Razorpay's payment popup, and after payment, the backend verifies the signature using HMAC-SHA256 before confirming the appointment.

**Q: How does real-time chat work without WebSockets?**
A: Polling — the frontend fetches new messages every 3 seconds using setInterval. Simple and works on free hosting tiers that don't support persistent WebSocket connections.

**Q: How is dark mode implemented?**
A: A `dark` class is toggled on the `<html>` element. Tailwind CSS uses `darkMode: 'class'` strategy so all components respond automatically. The preference is saved in localStorage.
