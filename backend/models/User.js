const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin', 'librarian'], required: true },
  fineAmount: { type: Number, default: 0 },
  year: { type: String },
  branch: { type: String },
  section: { type: String },
  collegeName: { type: String, default: 'My College' },
  collegeId: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
