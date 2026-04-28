# HopCare - Full-Stack Setup Guide

## 🎯 Overview
Your React application has been successfully converted to use a **real Node.js/MongoDB backend** with separate collections for patients, doctors, and appointments.

## 📁 Database Structure
When you open MongoDB Compass, you'll see three distinct collections in the `hopcare` database:
- **`patients`** - All patient user accounts
- **`doctors`** - All doctor user accounts  
- **`appointments`** - All appointment bookings

---

## 🚀 Quick Start

### Prerequisites
1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
3. **MongoDB Compass** (Optional but recommended) - [Download](https://www.mongodb.com/products/compass)

---

### Step 1: Install Backend Dependencies

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing

---

### Step 2: Start MongoDB

**Windows:**
```bash
# MongoDB should auto-start as a service after installation
# Verify it's running by checking Services or run:
mongod
```

**Mac/Linux:**
```bash
# Start MongoDB service
brew services start mongodb-community
# OR
sudo systemctl start mongod
```

**Verify MongoDB is running:**
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`
- You should see the connection succeed

---

### Step 3: Start the Backend Server

From the `backend` folder:

```bash
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

**The backend is now running at:** `http://localhost:5000`

---

### Step 4: Start the Frontend

Open a **new terminal** in the project root and run:

```bash
npm install
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**The frontend is now running at:** `http://localhost:5173`

---

## 🧪 Testing the Application

### Test 1: Register a Patient
1. Open `http://localhost:5173` in your browser
2. Click **"Get Started"** or **"Login"**
3. Click **"Sign up"**
4. Select role: **Patient**
5. Fill in details:
   - Name: John Doe
   - Email: john@test.com
   - Password: password123
   - Phone: 1234567890
6. Click **Register**

**Open MongoDB Compass:**
- Navigate to `hopcare` database → `patients` collection
- You should see your new patient document!

---

### Test 2: Register a Doctor
1. Logout from the patient account
2. Click **"Sign up"** again
3. Select role: **Doctor**
4. Fill in details:
   - Name: Dr. Sarah Smith
   - Email: sarah@test.com
   - Password: password123
   - Specialization: Cardiologist
   - Qualifications: MBBS, MD
   - Experience: 10 Years
   - Consultation Fee: 1500

**Open MongoDB Compass:**
- Navigate to `hopcare` database → `doctors` collection
- You should see your new doctor document!

---

### Test 3: Book an Appointment
1. Login as a **patient** (john@test.com)
2. Navigate to **"Book Appointment"**
3. Select a doctor (Dr. Sarah Smith or any pre-loaded doctor)
4. Choose a date and time
5. Add notes (optional)
6. Click **"Book Appointment"**

**Open MongoDB Compass:**
- Navigate to `hopcare` database → `appointments` collection
- You should see your new appointment with `patientId` and `doctorId`!

---

### Test 4: AI Symptom Checker
1. Navigate to **"Symptom Checker"**
2. Enter symptoms like:
   ```
   I have a severe headache, sensitivity to light, and nausea
   ```
3. Click **"Analyze Symptoms"**
4. The backend AI endpoint (`/api/ai/predict`) will process your symptoms and return:
   - Prediction (e.g., "Migraine")
   - Confidence level
   - Recommendation
   - Suggested specialist

---

## 🔧 Backend API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new patient or doctor
- **POST** `/api/auth/login` - Login (checks both collections)

### Doctors
- **GET** `/api/doctors` - Get all doctors

### Appointments
- **GET** `/api/appointments` - Get user's appointments (auth required)
- **POST** `/api/appointments` - Create new appointment (auth required)
- **PUT** `/api/appointments/:id/status` - Update status (auth required)

### Users
- **GET** `/api/users/:id` - Get user by ID (auth required)
- **PUT** `/api/users/:id` - Update user profile (auth required)

### AI
- **POST** `/api/ai/predict` - Analyze symptoms (auth required)

---

## 🗄️ Database Schema

### Patients Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "patient",
  createdAt: Date,
  updatedAt: Date
}
```

### Doctors Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "doctor",
  specialization: String,
  qualifications: String,
  experience: String,
  consultationFee: String,
  availability: [String], // e.g., ["09:00", "10:00"]
  hospital: String,
  location: String,
  rating: Number,
  reviewCount: Number,
  image: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Appointments Collection
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  patientName: String,
  doctorId: ObjectId (ref: Doctor),
  doctorName: String,
  date: String, // "YYYY-MM-DD"
  time: String, // "HH:MM"
  status: String, // "pending", "confirmed", "completed", "cancelled"
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

1. **Registration:**
   - User submits registration form
   - Backend hashes password with bcrypt
   - Creates document in `Patient` or `Doctor` collection based on role
   - Returns JWT token

2. **Login:**
   - Backend checks `Patient` collection first
   - If not found, checks `Doctor` collection
   - Verifies password
   - Returns JWT token

3. **Protected Routes:**
   - Frontend sends JWT token in `Authorization: Bearer <token>` header
   - Backend middleware verifies token
   - Extracts `userId` and `role` from token
   - Allows/denies access

---

## 🎨 Frontend Architecture

### Service Layer (`services/api.ts`)
All API calls go through this service, which:
- Adds JWT token to requests automatically
- Handles errors gracefully
- Matches the exact same function signatures as the old mock backend
- Stores user session in localStorage

### Context (`context/AuthContext.tsx`)
- **Switched from mock backend to real API**
- Manages authentication state
- Provides login/register/logout functions
- Persists user session

### Pages
All pages now communicate with the real backend:
- `Auth.tsx` - Login/Register
- `BookAppointment.tsx` - Create appointments
- `PatientDashboard.tsx` - View appointments
- `DoctorDashboard.tsx` - Manage appointments
- `SymptomChecker.tsx` - AI predictions (calls backend `/api/ai/predict`)
- `Profile.tsx` - Update user info

---

## 🐛 Troubleshooting

### Backend won't start
**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`
- **Solution:** Make sure MongoDB is running. Check Services on Windows or run `mongod` manually.

### CORS errors in browser
- **Solution:** The backend already has CORS enabled. Make sure backend is running on port 5000.

### "Invalid Token" errors
- **Solution:** Clear localStorage in browser DevTools and login again.

### Can't see data in MongoDB Compass
- **Solution:** 
  1. Connect to `mongodb://localhost:27017`
  2. Click on the `hopcare` database
  3. Collections will appear after you create data (register users, book appointments)

---

## 📦 Environment Variables

The backend uses a `.env` file (located in `backend/` folder):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hopcare
JWT_SECRET=hopcare_dev_secret_key_2026
```

**⚠️ Production Note:** Change `JWT_SECRET` to a strong random string in production!

---

## 🎓 Next Steps

1. ✅ Install dependencies
2. ✅ Start MongoDB
3. ✅ Start backend server
4. ✅ Start frontend dev server
5. ✅ Register test users
6. ✅ Open MongoDB Compass to see data
7. ✅ Test all features (appointments, symptom checker, etc.)

---

## 💡 Tips

- **MongoDB Compass** is the easiest way to view your database
- Use **Chrome DevTools** → Application → Local Storage to see JWT token
- The backend console logs all requests for debugging
- Patient and Doctor accounts are now in **separate collections** for better data organization

---

## ✨ Success!

You now have a fully functional full-stack healthcare application with:
- ✅ Real MongoDB database with 3 collections
- ✅ JWT authentication
- ✅ Separate Patient and Doctor models
- ✅ RESTful API
- ✅ AI symptom analysis
- ✅ Appointment booking system

**Happy coding! 🚀**
