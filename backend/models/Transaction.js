const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  type: { type: String, enum: ['ordered', 'issued', 'returned'], default: 'ordered' },
  issuedDate: { type: Date },
  expectedReturnDate: { type: Date },
  returnDate: { type: Date },
  fineAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['ordered', 'active', 'completed'], default: 'ordered' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
