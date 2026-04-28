const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  imageUrl: { type: String, default: 'https://via.placeholder.com/150' },
  loanPeriod: { type: Number, default: 14 }, // Default 14 days
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
