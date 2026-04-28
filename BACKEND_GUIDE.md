# HopCare - Backend Implementation Guide

This file contains the code required to run the real Node.js/Express backend for the final year project submission.

## 1. Setup

1. Create a folder named `backend`.
2. Run `npm init -y`.
3. Install dependencies: `npm install express mongoose cors dotenv jsonwebtoken bcryptjs`.
4. Create `server.js` and `.env`.

## 2. Environment Variables (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hopcare
JWT_SECRET=your_jwt_secret_key
```

## 3. Server Code (server.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// --- Schemas ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['patient', 'doctor'] },
  specialization: String, // For doctors
  availability: [String] // For doctors
});
const User = mongoose.model('User', userSchema);

const appointmentSchema = new mongoose.Schema({
  patientId: String,
  doctorId: String,
  patientName: String,
  doctorName: String,
  date: String,
  time: String,
  status: { type: String, default: 'pending' },
  notes: String
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

const aiRecordSchema = new mongoose.Schema({
  userId: String,
  symptoms: String,
  prediction: String,
  confidence: String,
  recommendation: String,
  createdAt: { type: Date, default: Date.now }
});
const AiRecord = mongoose.model('AiRecord', aiRecordSchema);

// --- Middleware ---
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

// --- Routes ---

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  try {
    await user.save();
    res.send({ user: { id: user._id, name, email, role } });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Email not found');
  
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.header('Authorization', token).send({ token, user: { id: user._id, name: user.name, role: user.role } });
});

// Doctors
app.get('/api/doctors', async (req, res) => {
  const doctors = await User.find({ role: 'doctor' }).select('-password');
  res.send(doctors);
});

// Appointments
app.get('/api/appointments', auth, async (req, res) => {
  let query = {};
  if (req.user.role === 'doctor') query.doctorId = req.user._id;
  else query.patientId = req.user._id;
  
  const appointments = await Appointment.find(query);
  res.send(appointments);
});

app.post('/api/appointments', auth, async (req, res) => {
  const appointment = new Appointment(req.body);
  await appointment.save();
  res.send(appointment);
});

app.put('/api/appointments/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const updated = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.send(updated);
});

// AI Symptom Checker (Rule-Based Logic)
const CONDITIONS_DB = [
  { keywords: ['headache', 'migraine', 'light', 'nausea'], prediction: "Migraine", specialist: "Neurologist", recommendation: "Rest in a dark, quiet room." },
  { keywords: ['fever', 'cold', 'cough', 'runny'], prediction: "Viral Infection", specialist: "General Physician", recommendation: "Rest and fluids." },
  { keywords: ['chest', 'pain', 'heart'], prediction: "Potential Cardiac Issue", specialist: "Cardiologist", recommendation: "Seek immediate attention." },
  { keywords: ['skin', 'rash', 'itch'], prediction: "Dermatitis", specialist: "Dermatologist", recommendation: "Avoid irritants." }
];

app.post('/api/ai/predict', auth, async (req, res) => {
  const { symptoms } = req.body;
  const lowerSymptoms = symptoms.toLowerCase();
  
  let bestMatch = null;
  let maxCount = 0;

  for (const condition of CONDITIONS_DB) {
    const count = condition.keywords.filter(k => lowerSymptoms.includes(k)).length;
    if (count > maxCount) {
      maxCount = count;
      bestMatch = condition;
    }
  }

  const result = bestMatch && maxCount > 0 ? {
    prediction: bestMatch.prediction,
    confidence: maxCount >= 2 ? "High" : "Medium",
    recommendation: bestMatch.recommendation,
    specialist: bestMatch.specialist
  } : {
    prediction: "General Symptoms",
    confidence: "Low",
    recommendation: "Consult a General Physician.",
    specialist: "General Physician"
  };

  res.send(result);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```