const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
  senderId:      { type: String, required: true },
  senderName:    { type: String, required: true },
  senderRole:    { type: String, enum: ['patient', 'doctor'], required: true },
  content:       { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
