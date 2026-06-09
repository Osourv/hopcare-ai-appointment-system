const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor',  required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  rating:        { type: Number, min: 1, max: 5, required: true },
  comment:       { type: String, maxlength: 300, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
