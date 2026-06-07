const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be Patient or Doctor
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['system', 'appointment', 'message'], default: 'system' },
  link: { type: String }
}, { 
  timestamps: true,
  collection: 'notifications'
});

module.exports = mongoose.model('Notification', notificationSchema);