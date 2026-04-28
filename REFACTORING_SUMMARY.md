# Backend Refactoring Summary

## ✅ Changes Completed

### 1. **Model Refactoring**
- ❌ **Deleted:** `backend/models/User.js`
- ✅ **Created:** `backend/models/Patient.js` → Collection: `patients`
- ✅ **Created:** `backend/models/Doctor.js` → Collection: `doctors`
- ✅ **Updated:** `backend/models/Appointment.js` → Collection: `appointments`

### 2. **Server.js Updates**

#### Import Changes
```javascript
// OLD:
const User = require('./models/User');

// NEW:
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
```

#### Register Route (POST `/api/auth/register`)
- Now checks **both** Patient and Doctor collections for duplicate emails
- Creates document in **Patient collection** if role is 'patient'
- Creates document in **Doctor collection** if role is 'doctor'

#### Login Route (POST `/api/auth/login`)
- Checks **Patient collection** first
- If not found, checks **Doctor collection**
- Returns correct role and user data

#### Doctors Route (GET `/api/doctors`)
- Now fetches directly from **Doctor model** (not filtering by role)

#### New Route: Get User By ID (GET `/api/users/:id`)
- Tries Patient collection first
- Falls back to Doctor collection if not found
- Returns 404 if not in either collection

#### Update Profile Route (PUT `/api/users/:id`)
- Checks token role
- Updates in **Patient collection** for patients
- Updates in **Doctor collection** for doctors

### 3. **Frontend Updates**

✅ **Already Updated:**
- `services/api.ts` - Fully functional with all methods matching mockBackend
- `context/AuthContext.tsx` - Switched to use real API service
- `pages/SymptomChecker.tsx` - Uses backend `/api/ai/predict` endpoint

---

## 🗄️ MongoDB Collections

When you run the app and create data, you'll see:

### `patients` Collection
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@test.com",
  "password": "$2a$10$...", // hashed
  "phone": "1234567890",
  "role": "patient",
  "createdAt": "2026-01-14T...",
  "updatedAt": "2026-01-14T..."
}
```

### `doctors` Collection
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Dr. Sarah Smith",
  "email": "sarah@test.com",
  "password": "$2a$10$...", // hashed
  "phone": "9876543210",
  "role": "doctor",
  "specialization": "Cardiologist",
  "qualifications": "MBBS, MD",
  "experience": "10 Years",
  "consultationFee": "1500",
  "availability": ["09:00", "10:00", "11:00", "14:00"],
  "hospital": "City Hospital",
  "location": "New York",
  "rating": 4.5,
  "reviewCount": 0,
  "createdAt": "2026-01-14T...",
  "updatedAt": "2026-01-14T..."
}
```

### `appointments` Collection
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "patientId": "507f1f77bcf86cd799439011", // ObjectId ref to Patient
  "patientName": "John Doe",
  "doctorId": "507f1f77bcf86cd799439012", // ObjectId ref to Doctor
  "doctorName": "Dr. Sarah Smith",
  "date": "2026-01-20",
  "time": "10:00",
  "status": "pending",
  "notes": "First consultation",
  "createdAt": "2026-01-14T...",
  "updatedAt": "2026-01-14T..."
}
```

---

## 🎯 Testing Checklist

- [ ] Start MongoDB (`mongod` or service)
- [ ] Start backend (`cd backend && npm start`)
- [ ] Start frontend (`npm run dev`)
- [ ] Register a patient → Check `patients` collection in Compass
- [ ] Register a doctor → Check `doctors` collection in Compass
- [ ] Login as patient → Verify JWT token works
- [ ] Login as doctor → Verify JWT token works
- [ ] Book an appointment → Check `appointments` collection in Compass
- [ ] View appointments in dashboard
- [ ] Update user profile
- [ ] Use symptom checker

---

## 📝 Key Benefits

1. **Separation of Concerns:** Patients and doctors are in separate collections
2. **Better Performance:** No need to filter by role when querying
3. **Cleaner Schema:** Each model only has relevant fields
4. **Scalability:** Easy to add patient-only or doctor-only features
5. **Clear Database Structure:** Three distinct collections visible in Compass

---

## 🚨 Important Notes

- **Old User model is deleted** - All data now in Patient/Doctor collections
- **References updated** - Appointments now reference Patient and Doctor models
- **Login logic updated** - Checks both collections automatically
- **Frontend unchanged** - API signatures remain the same (seamless switch)

---

## 🎉 Result

Open **MongoDB Compass** → Connect to `mongodb://localhost:27017` → Open `hopcare` database

You will see exactly **3 folders** (collections):
1. 📁 **patients**
2. 📁 **doctors**
3. 📁 **appointments**

Perfect data organization! 🎯
