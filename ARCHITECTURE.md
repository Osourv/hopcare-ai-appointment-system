# 🏗️ HopCare Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                     http://localhost:5173                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pages:                      Context:                           │
│  • Auth.tsx                  • AuthContext.tsx (uses real API)  │
│  • PatientDashboard.tsx                                         │
│  • DoctorDashboard.tsx       Services:                          │
│  • BookAppointment.tsx       • api.ts (HTTP client)             │
│  • SymptomChecker.tsx        • geminiService.ts (not used)      │
│  • Profile.tsx               • mockBackend.ts (not used)        │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP Requests (JWT Token in headers)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                  │
│                     http://localhost:5000/api                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Routes:                                                        │
│  POST /auth/register  → Create Patient or Doctor               │
│  POST /auth/login     → Check both collections                 │
│  GET  /doctors        → Fetch from Doctor collection           │
│  GET  /appointments   → User's appointments                    │
│  POST /appointments   → Create booking                         │
│  PUT  /appointments/:id/status → Update status                │
│  GET  /users/:id      → Find in Patient or Doctor             │
│  PUT  /users/:id      → Update profile                        │
│  POST /ai/predict     → Symptom analysis (rule-based)          │
│                                                                 │
│  Middleware:                                                    │
│  • CORS enabled                                                │
│  • JWT authentication                                          │
│  • JSON body parser                                            │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Mongoose ODM
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                           │
│               mongodb://localhost:27017/hopcare                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 patients (Collection)                                       │
│  ├─ _id: ObjectId                                              │
│  ├─ name: String                                               │
│  ├─ email: String (unique)                                     │
│  ├─ password: String (hashed)                                  │
│  ├─ phone: String                                              │
│  ├─ role: "patient"                                            │
│  └─ timestamps                                                 │
│                                                                 │
│  📁 doctors (Collection)                                        │
│  ├─ _id: ObjectId                                              │
│  ├─ name: String                                               │
│  ├─ email: String (unique)                                     │
│  ├─ password: String (hashed)                                  │
│  ├─ phone: String                                              │
│  ├─ role: "doctor"                                             │
│  ├─ specialization: String                                     │
│  ├─ qualifications: String                                     │
│  ├─ experience: String                                         │
│  ├─ consultationFee: String                                    │
│  ├─ availability: [String]                                     │
│  ├─ hospital: String                                           │
│  ├─ location: String                                           │
│  ├─ rating: Number                                             │
│  ├─ reviewCount: Number                                        │
│  └─ timestamps                                                 │
│                                                                 │
│  📁 appointments (Collection)                                   │
│  ├─ _id: ObjectId                                              │
│  ├─ patientId: ObjectId → patients                            │
│  ├─ patientName: String                                        │
│  ├─ doctorId: ObjectId → doctors                              │
│  ├─ doctorName: String                                         │
│  ├─ date: String                                               │
│  ├─ time: String                                               │
│  ├─ status: String                                             │
│  ├─ notes: String                                              │
│  └─ timestamps                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Patient Registration
```
1. User fills registration form (Frontend)
   └─> Name: "John Doe", Email: "john@test.com", Role: "patient"

2. POST /api/auth/register (Backend)
   └─> Hash password with bcrypt
   └─> Create document in 'patients' collection
   └─> Generate JWT token

3. MongoDB saves to 'patients' collection
   {
     _id: "507f...",
     name: "John Doe",
     email: "john@test.com",
     password: "$2a$10...", // hashed
     role: "patient",
     ...
   }

4. Return token + user data to frontend
   └─> Frontend stores token in localStorage
   └─> User is logged in!
```

### Example 2: Login Flow
```
1. User enters email + password

2. POST /api/auth/login (Backend)
   └─> Check 'patients' collection for email
   └─> If not found, check 'doctors' collection
   └─> Compare password with bcrypt
   └─> Generate JWT token with { id, role }

3. Return token + user data
   └─> Frontend stores in localStorage
```

### Example 3: Booking Appointment
```
1. Patient selects doctor, date, time (Frontend)

2. POST /api/appointments (Backend)
   └─> Verify JWT token (extract userId)
   └─> Create appointment document
   {
     patientId: "507f..." (from token),
     doctorId: "609a...",
     date: "2026-01-20",
     time: "10:00",
     status: "pending"
   }

3. MongoDB saves to 'appointments' collection

4. Frontend shows success message
```

---

## 🔐 Authentication System

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend checks:                    │
│  1. patients.findOne({ email })     │
│  2. doctors.findOne({ email })      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Compare password (bcrypt)          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Generate JWT Token:                │
│  jwt.sign({ id, role }, SECRET)     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Return token to frontend           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend stores in localStorage    │
│  All future requests include:       │
│  Authorization: Bearer <token>      │
└─────────────────────────────────────┘
```

---

## 📂 File Structure

```
hopcare---ai-healthcare/
│
├── backend/
│   ├── models/
│   │   ├── Patient.js        ✅ NEW (collection: 'patients')
│   │   ├── Doctor.js         ✅ NEW (collection: 'doctors')
│   │   ├── Appointment.js    ✅ UPDATED (collection: 'appointments')
│   │   └── User.js           ❌ DELETED
│   │
│   ├── server.js             ✅ UPDATED (uses Patient & Doctor)
│   ├── package.json
│   ├── .env.example
│   └── node_modules/
│
├── services/
│   ├── api.ts                ✅ UPDATED (full API implementation)
│   ├── mockBackend.ts        (not used anymore)
│   └── geminiService.ts      (not used anymore)
│
├── context/
│   └── AuthContext.tsx       ✅ UPDATED (uses api.ts)
│
├── pages/
│   ├── Auth.tsx
│   ├── PatientDashboard.tsx
│   ├── DoctorDashboard.tsx
│   ├── BookAppointment.tsx
│   ├── SymptomChecker.tsx    ✅ UPDATED (uses backend AI)
│   └── Profile.tsx
│
├── components/
│   ├── Layout.tsx
│   └── Footer.tsx
│
├── types.ts
├── App.tsx
├── package.json
│
├── start-backend.bat         ✅ NEW (quick start script)
├── SETUP_GUIDE.md           ✅ NEW (comprehensive guide)
├── QUICK_START.md           ✅ NEW (quick reference)
├── REFACTORING_SUMMARY.md   ✅ NEW (what changed)
└── ARCHITECTURE.md          ✅ NEW (this file)
```

---

## 🎯 Key Benefits of This Architecture

### 1. **Separation of Concerns**
- Frontend handles UI/UX
- Backend handles business logic
- Database handles data persistence

### 2. **Scalability**
- Easy to add new features
- Can deploy frontend and backend separately
- MongoDB scales horizontally

### 3. **Security**
- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Separate collections for data isolation

### 4. **Maintainability**
- Clear folder structure
- Models define data schemas
- API service centralizes HTTP calls
- Context manages authentication state

### 5. **Organized Data**
- 3 distinct collections in MongoDB
- Clear relationships (appointments reference patients/doctors)
- Easy to query and analyze data

---

## 🚀 Performance Optimizations

1. **No Role Filtering:** Doctors are in separate collection (faster queries)
2. **Indexed Fields:** Email fields are unique (automatic indexing)
3. **JWT Tokens:** Stateless authentication (no session storage)
4. **Lean Queries:** Password excluded from responses
5. **Sorted Results:** Appointments sorted by creation date

---

## 🎉 Result

You now have a **production-ready full-stack application** with:
- ✅ Real database with organized collections
- ✅ Secure JWT authentication
- ✅ RESTful API design
- ✅ Separate Patient & Doctor models
- ✅ React SPA frontend
- ✅ All features working end-to-end

**Perfect for your final year project! 🎓**
