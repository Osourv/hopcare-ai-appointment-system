const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  image: { type: String },
  role: { 
    type: String, 
    default: 'patient' 
  }
}, { 
  timestamps: true,
  collection: 'patients' // Explicitly set collection name
});

module.exports = mongoose.model('Patient', patientSchema);
