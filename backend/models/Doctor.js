const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    default: 'doctor' 
  },
  // Doctor specific fields
  specialization: { type: String },
  qualifications: { type: String },
  experience: { type: String },
  consultationFee: { type: String },
  availability: { type: [String], default: [] },
  hospital: { type: String },
  location: { type: String },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  image: { type: String },
  bio: { type: String }
}, { 
  timestamps: true,
  collection: 'doctors' // Explicitly set collection name
});

module.exports = mongoose.model('Doctor', doctorSchema);
