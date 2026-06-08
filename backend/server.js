const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

// Import Models
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Notification = require('./models/Notification');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hopcare';

// Resend email client (HTTPS API — works on Render free tier)
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  try {
    await resend.emails.send({
      from: 'HopCare <noreply@hopcare.me>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
  }
}

// Razorpay instance (initialised lazily so server starts even without keys)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// In-memory OTP store: email → { otp, expiresAt, user, userRole }
const otpStore = new Map();

// In-memory store for pending registrations: email → { otp, expiresAt, userData }
const registerOtpStore = new Map();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://hopcare.me',
      'https://www.hopcare.me',
    ];
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for now; tighten after domain is set
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Rule-Based AI Logic Database ---
const CONDITIONS_DB = [
  { keywords: ['headache', 'migraine', 'light', 'sensitivity', 'nausea', 'dizzy'], prediction: "Migraine", specialist: "Neurologist", recommendation: "Rest in a dark, quiet room. Stay hydrated and avoid screens." },
  { keywords: ['fever', 'cold', 'cough', 'runny', 'sneeze', 'throat', 'congestion'], prediction: "Viral Infection / Flu", specialist: "General Physician", recommendation: "Rest, drink plenty of fluids, and monitor temperature. Isolate if contagious." },
  { keywords: ['chest', 'pain', 'heart', 'breath', 'pressure', 'tight'], prediction: "Potential Cardiac Issue", specialist: "Cardiologist", recommendation: "Seek immediate medical attention if pain is severe. Consult a cardiologist." },
  { keywords: ['skin', 'rash', 'itch', 'redness', 'dry', 'bump'], prediction: "Dermatitis / Skin Allergy", specialist: "Dermatologist", recommendation: "Avoid irritants, keep area clean and moisturized. Do not scratch." },
  { keywords: ['stomach', 'pain', 'digest', 'acid', 'bloat', 'vomit', 'diarrhea'], prediction: "Gastritis / Indigestion", specialist: "Gastroenterologist", recommendation: "Avoid spicy/oily foods, eat smaller meals, and stay hydrated." },
  { keywords: ['joint', 'pain', 'knee', 'back', 'stiff', 'bone', 'muscle'], prediction: "Arthritis / Muscular Strain", specialist: "Orthopedist", recommendation: "Rest affected area, apply ice/heat as needed. Avoid heavy lifting." },
  { keywords: ['tooth', 'gum', 'pain', 'mouth', 'bleed', 'sensitive'], prediction: "Dental Issue", specialist: "Dentist", recommendation: "Rinse with warm salt water and schedule a dental visit." },
  { keywords: ['vision', 'eye', 'blur', 'see', 'red', 'watery'], prediction: "Vision / Eye Strain", specialist: "Ophthalmologist", recommendation: "Rest eyes, follow the 20-20-20 rule. Avoid rubbing eyes." },
  { keywords: ['ear', 'hear', 'pain', 'ring', 'wax'], prediction: "Ear Infection / Tinnitus", specialist: "ENT Specialist", recommendation: "Keep ear dry, do not insert objects. Consult an ENT if pain persists." },
  { keywords: ['sad', 'anxiety', 'depress', 'mood', 'sleep', 'worry', 'panic'], prediction: "Anxiety / Stress", specialist: "Psychiatrist", recommendation: "Practice deep breathing and relaxation techniques. Talk to a professional." }
];

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// --- Routes ---

// 1. Register — validates data, sends OTP, does NOT create account yet
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, qualifications, experience, consultationFee } = req.body;

    // Check if user exists in either collection
    const existingPatient = await Patient.findOne({ email });
    const existingDoctor = await Doctor.findOne({ email });
    if (existingPatient || existingDoctor) return res.status(400).json({ message: 'Email already exists' });

    // Hash password upfront so it's ready after OTP verification
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP and store pending registration data
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    registerOtpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userData: { name, email, password: hashedPassword, role, phone, specialization, qualifications, experience, consultationFee }
    });

    console.log(`\n📧 Register OTP for ${email}: ${otp}\n`);

    sendEmail(email, 'Verify your HopCare Account', `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#2563eb;margin-bottom:8px;">HopCare Account Verification</h2>
        <p style="color:#475569;">Use the OTP below to verify your email and complete registration. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#0f172a;text-align:center;padding:24px 0;">${otp}</div>
        <p style="color:#94a3b8;font-size:13px;">If you did not request this, please ignore this email.</p>
      </div>
    `);

    res.json({ requiresOtp: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1b. Verify Register OTP — creates account and issues JWT
app.post('/api/auth/verify-register-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = registerOtpStore.get(email);

    if (!record) return res.status(400).json({ message: 'OTP expired or not found. Please register again.' });
    if (Date.now() > record.expiresAt) {
      registerOtpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });

    registerOtpStore.delete(email);

    const { name, email: userEmail, password, role, phone, specialization, qualifications, experience, consultationFee } = record.userData;

    let savedUser;
    if (role === 'doctor') {
      const newDoctor = new Doctor({
        name, email: userEmail, password, role: 'doctor', phone,
        specialization, qualifications, experience, consultationFee,
        availability: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      });
      savedUser = await newDoctor.save();
    } else {
      const newPatient = new Patient({ name, email: userEmail, password, role: 'patient', phone });
      savedUser = await newPatient.save();
    }

    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, JWT_SECRET);
    res.json({
      token,
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role, phone: savedUser.phone }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Login — verifies credentials, sends OTP, does NOT issue JWT yet
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Patient.findOne({ email });
    let userRole = 'patient';

    if (!user) {
      user = await Doctor.findOne({ email });
      userRole = 'doctor';
    }

    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, user, userRole });

    console.log(`\n📧 OTP for ${email}: ${otp}\n`);

    sendEmail(email, 'Your HopCare Login OTP', `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#2563eb;margin-bottom:8px;">HopCare Login Verification</h2>
        <p style="color:#475569;">Use the OTP below to complete your login. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#0f172a;text-align:center;padding:24px 0;">${otp}</div>
        <p style="color:#94a3b8;font-size:13px;">If you did not request this, please ignore this email.</p>
      </div>
    `);

    res.json({ requiresOtp: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2b. Verify OTP — issues JWT after successful OTP check
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record) return res.status(400).json({ message: 'OTP expired or not found. Please login again.' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });

    otpStore.delete(email);
    const token = jwt.sign({ id: record.user._id, role: record.userRole }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: record.user._id,
        name: record.user.name,
        email: record.user.email,
        role: record.userRole,
        phone: record.user.phone,
        specialization: record.user.specialization,
        availability: record.user.availability
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get All Doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Get Appointments (For Patient or Doctor)
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      query.doctorId = req.user.id;
    } else {
      query.patientId = req.user.id;
    }
    
      const appointments = await Appointment.find(query)
        .populate('patientId', 'image name')
        .populate('doctorId', 'image name')
        .sort({ createdAt: -1 });
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // 5. Get User by ID
  app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
    let user = await Patient.findById(req.params.id).select('-password');
    
    // If not found, try Doctor collection
    if (!user) {
      user = await Doctor.findById(req.params.id).select('-password');
    }
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Create Appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    const saved = await newAppointment.save();

    res.json(saved);

    // Notify the doctor about the new appointment (non-blocking)
    try {
      const doctor = await Doctor.findById(saved.doctorId);
      if (doctor) {
        const patient = await Patient.findById(saved.patientId);
        const patientName = patient ? patient.name : 'a patient';
        const notification = new Notification({
          userId: saved.doctorId,
          title: 'New Appointment Booked',
          message: `You have a new appointment with ${patientName} on ${saved.date} at ${saved.time}.`,
          type: 'appointment',
          link: `/doctor-dashboard`
        });
        await notification.save();
      }
    } catch (notifErr) {
      console.error('Failed to create appointment notification:', notifErr.message);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Update Appointment Status
app.put('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('patientId', 'name').populate('doctorId', 'name');

    res.json(updated);

    // Notify the patient about the status change (non-blocking)
    if (updated) {
      try {
        const patientId = updated.patientId?._id || updated.patientId;
        const doctorName = updated.doctorId?.name || 'your doctor';
        if (patientId) {
          const notification = new Notification({
            userId: patientId,
            title: `Appointment Status Updated to ${status}`,
            message: `Your appointment with Dr. ${doctorName} on ${updated.date} at ${updated.time} is now ${status}.`,
            type: 'appointment',
            link: `/dashboard`
          });
          await notification.save();
        }
      } catch (notifErr) {
        console.error('Failed to create status notification:', notifErr.message);
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update appointment notes (by patient)
app.put('/api/appointments/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update appointment prescription
app.put('/api/appointments/:id/prescription', authenticateToken, async (req, res) => {
  try {
    const { prescription } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { prescription }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

  // Get Queue Status
  app.get('/api/appointments/:id/queue', authenticateToken, async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
      
      if (appointment.status === 'active') {
        return res.json({ position: 0, waitTime: 0, isActive: true });
      }
      
      if (appointment.status !== 'waiting') {
        return res.json({ position: 0, waitTime: 0, isActive: false });
      }

      const aheadCount = await Appointment.countDocuments({
         doctorId: appointment.doctorId,
         date: appointment.date,
         time: appointment.time,
         status: { $in: ['waiting', 'active'] },
         createdAt: { $lt: appointment.createdAt }
      });
      
      const waitTime = aheadCount * 15;
      res.json({ position: aheadCount + 1, waitTime, isActive: false });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Doctor Next Patient
  app.post('/api/doctors/next-patient', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Unauthorized' });
      
      const { date, time } = req.body;
      
      const nextAppt = await Appointment.findOne({ doctorId: req.user.id, date, time, status: 'waiting' }).sort({ createdAt: 1 });
      if (nextAppt) {
         nextAppt.status = 'active';
         await nextAppt.save();

         // Notify the patient that their turn is active
         const doctor = await Doctor.findById(req.user.id);
         const notification = new Notification({
           userId: nextAppt.patientId,
           title: 'Your Turn is Active!',
           message: `Your consultation with Dr. ${doctor.name} on ${nextAppt.date} at ${nextAppt.time} is now active. Please join the video consultation.`, 
           type: 'appointment',
           link: `/consultation/${nextAppt._id}`
         });
         await notification.save();

         return res.json({ message: 'Next patient is active', activePatient: nextAppt });
      }
      res.json({ message: 'Queue is empty' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Get Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Notification
app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const saved = await notification.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark Notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id, 
      { read: true }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all Notifications as read
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId: userId }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Update User Profile
  app.put('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.id) return res.status(403).json({ message: 'Unauthorized' });
    try {
      let updated;
      // Update in appropriate collection based on role
      if (req.user.role === 'doctor') {
        updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      } else {
        updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// 8. AI Symptom Checker (Rule-Based)
app.post('/api/ai/predict', authenticateToken, async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ message: "Symptoms required" });

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

    // Simulate "Processing" delay for UX
    await new Promise(r => setTimeout(r, 800));

    if (bestMatch && maxCount > 0) {
      res.json({
        prediction: bestMatch.prediction,
        confidence: maxCount >= 3 ? "High" : "Medium",
        recommendation: bestMatch.recommendation,
        specialist: bestMatch.specialist
      });
    } else {
      res.json({
        prediction: "General Symptoms",
        confidence: "Low",
        recommendation: "Your symptoms are nonspecific. Please consult a General Physician for a complete checkup.",
        specialist: "General Physician"
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Payment Routes (Razorpay) ---

// Create a Razorpay order — called before opening the payment modal
app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env' });
    }

    const { amount } = req.body; // amount in INR (e.g. 800)
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    res.status(500).json({ message: err.error?.description || err.message });
  }
});

// Verify payment signature and create appointment
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentData } = req.body;

    // Verify HMAC SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Payment verified — now create the appointment
    const { patientId, patientName, doctorId, doctorName, date, time, notes, documents } = appointmentData;
    const newAppointment = new Appointment({
      patientId, patientName, doctorId, doctorName, date, time,
      notes: notes || '',
      documents: documents || [],
      status: 'pending',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
    const saved = await newAppointment.save();

    // Notify the doctor (non-blocking)
    try {
      const patient = await Patient.findById(patientId).select('name');
      const doctor = await Doctor.findById(doctorId).select('name');
      await Notification.create({
        userId: doctorId,
        title: 'New Appointment Request',
        message: `${patient?.name || patientName} has requested an appointment on ${date} at ${time}.`,
        type: 'appointment',
        link: '/doctor-dashboard',
      });
    } catch (notifErr) {
      console.error('Notification error (non-fatal):', notifErr.message);
    }

    res.json({ success: true, appointment: saved });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Test-mode bypass — only works when using rzp_test_ keys
app.post('/api/payment/test-book', authenticateToken, async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    if (!keyId.startsWith('rzp_test_')) {
      return res.status(403).json({ message: 'Test booking only available in test mode.' });
    }

    const { appointmentData } = req.body;
    const { patientId, patientName, doctorId, doctorName, date, time, notes, documents } = appointmentData;

    const newAppointment = new Appointment({
      patientId, patientName, doctorId, doctorName, date, time,
      notes: notes || '',
      documents: documents || [],
      status: 'pending',
      paymentId: `test_${Date.now()}`,
      orderId: `test_order_${Date.now()}`,
    });
    const saved = await newAppointment.save();

    try {
      await Notification.create({
        userId: doctorId,
        title: 'New Appointment Request',
        message: `${patientName} has requested an appointment on ${date} at ${time}.`,
        type: 'appointment',
        link: '/doctor-dashboard',
      });
    } catch (notifErr) {
      console.error('Notification error (non-fatal):', notifErr.message);
    }

    res.json({ success: true, appointment: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Keep-alive ping endpoint (used by external cron to prevent Render cold start)
app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));