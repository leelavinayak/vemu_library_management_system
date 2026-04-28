const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' } // For book restoration notifications
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
