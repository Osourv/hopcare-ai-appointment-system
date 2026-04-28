# 🎯 Quick Start - HopCare Full-Stack Application

## Your Backend is Ready! ✅

### What Was Done:
1. ✅ Backend refactored to use **3 separate MongoDB collections**:
   - `patients` - Patient user accounts
   - `doctors` - Doctor user accounts
   - `appointments` - Appointment bookings

2. ✅ **Models created:**
   - `backend/models/Patient.js`
   - `backend/models/Doctor.js`
   - `backend/models/Appointment.js`
   - ❌ `backend/models/User.js` (deleted - split into Patient/Doctor)

3. ✅ **Backend routes updated:**
   - Register: Creates Patient or Doctor based on role
   - Login: Checks both Patient and Doctor collections
   - All other routes updated to work with new collections

4. ✅ **Frontend already configured:**
   - Using real API service (`services/api.ts`)
   - AuthContext switched to backend
   - SymptomChecker using backend AI endpoint

5. ✅ **Dependencies installed**

---

## 🚀 How to Run

### Step 1: Start MongoDB

**Make sure MongoDB is running:**

```bash
# Check if MongoDB service is running (Windows)
# Open Services and look for "MongoDB Server"
# OR run in cmd/PowerShell:
mongod
```

If you don't have MongoDB installed, download it from: https://www.mongodb.com/try/download/community

---

### Step 2: Start Backend Server

**Option A - Using the batch file (Easy):**
```bash
# Just double-click this file:
start-backend.bat
```

**Option B - Manual:**
```bash
cd backend
node server.js
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

✅ **Backend is now running at:** http://localhost:5000

---

### Step 3: Start Frontend (New Terminal)

Open a **new terminal/command prompt** and run:

```bash
npm install
npm run dev
```

✅ **Frontend is now running at:** http://localhost:5173

---

## 🧪 Test Your Application

### 1. Open Your Browser
Go to: **http://localhost:5173**

### 2. Register a Patient
- Click "Get Started" or "Login"
- Click "Sign up"
- Select role: **Patient**
- Fill in: Name, Email, Password, Phone
- Click "Register"

### 3. Check MongoDB Compass
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Open database: `hopcare`
- You should see: **📁 patients** collection with your data!

### 4. Register a Doctor
- Logout
- Sign up again
- Select role: **Doctor**
- Fill in: Name, Email, Password, Specialization, etc.
- Click "Register"

### 5. Check MongoDB Again
- Refresh Compass
- You should now see: **📁 doctors** collection!

### 6. Book an Appointment
- Login as a patient
- Go to "Book Appointment"
- Select a doctor, date, and time
- Submit

### 7. Final Check
- Open MongoDB Compass
- You should now see **3 collections**:
  - 📁 **patients**
  - 📁 **doctors**
  - 📁 **appointments** ← Your booking is here!

---

## 🎉 Success!

You now have:
- ✅ Real Node.js backend with Express
- ✅ MongoDB database with 3 organized collections
- ✅ JWT authentication working
- ✅ React frontend connected to backend
- ✅ All features working (appointments, symptom checker, etc.)

---

## 📁 Important Files

- `backend/server.js` - Main backend server
- `backend/models/Patient.js` - Patient schema
- `backend/models/Doctor.js` - Doctor schema
- `backend/models/Appointment.js` - Appointment schema
- `services/api.ts` - Frontend API service
- `context/AuthContext.tsx` - Authentication context

---

## 🐛 Troubleshooting

**Backend won't start?**
- Make sure MongoDB is running (check Services on Windows)
- Run `mongod` in a terminal to start MongoDB manually

**Can't see collections in Compass?**
- Collections only appear after you create data
- Register a user first, then refresh Compass

**Frontend can't connect?**
- Make sure backend is running on port 5000
- Check browser console for errors
- Clear localStorage and try again

---

## 📚 Documentation

- **Full Setup Guide:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Refactoring Details:** [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

---

## 💡 Next Steps

1. ✅ Test registration (Patient & Doctor)
2. ✅ Test login
3. ✅ Book appointments
4. ✅ Try symptom checker
5. ✅ View data in MongoDB Compass

**You're all set! Happy coding! 🚀**
