const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'waiting', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  notes: { type: String },
  prescription: { type: String },
  paymentId: { type: String },
  orderId: { type: String },
  documents: [{
    name: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: String, required: true }, // base64 encoded
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'appointments' // Explicitly set collection name
});

module.exports = mongoose.model('Appointment', appointmentSchema);