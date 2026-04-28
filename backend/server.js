require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const User = require('./models/User');
const Book = require('./models/Book');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');

const app = express();

// --- PRODUCTION MIDDLEWARE ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers
app.use(compression()); // Compress responses

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' })); // Body parser with limit
app.use('/uploads', express.static(process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, 'uploads')));

// --- MULTER CONFIGURATION ---
// Note: Local storage will not work on Vercel's ephemeral filesystem.
// For true production, consider Cloudinary or AWS S3.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};
connectDB();

// --- AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// --- ROUTES ---
app.use('/api/auth', authRoutes);

// Helper for async errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Users API
app.get('/api/users', authMiddleware, asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
}));

app.get('/api/users/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
}));

app.get('/api/users/:id', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

app.put('/api/users/:id', authMiddleware, asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.password && updates.password.trim() !== '') {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  } else {
    delete updates.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(user);
}));

app.delete('/api/users/:id', authMiddleware, asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
}));

// Books API
app.get('/api/books', asyncHandler(async (req, res) => {
  const books = await Book.find();
  res.json(books);
}));

app.post('/api/books', authMiddleware, asyncHandler(async (req, res) => {
  const newBook = new Book(req.body);
  const book = await newBook.save();
  res.json(book);
}));

app.put('/api/books/:id', authMiddleware, asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
}));

app.delete('/api/books/:id', authMiddleware, asyncHandler(async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Book deleted' });
}));

// Transactions API
app.get('/api/transactions', authMiddleware, asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'student' || req.user.role === 'teacher') {
    query.user = req.user.id;
  }
  const transactions = await Transaction.find(query).populate('book', 'title imageUrl').populate('user', 'name role');
  res.json(transactions);
}));

app.post('/api/transactions', authMiddleware, asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const existingTransaction = await Transaction.findOne({ 
    user: req.user.id, 
    book: bookId, 
    status: { $in: ['active', 'ordered'] } 
  });
  
  if (existingTransaction) {
    return res.status(400).json({ 
      message: existingTransaction.status === 'ordered' 
        ? 'You have already ordered this book. Please collect it from the library.' 
        : 'You have already issued this book and haven\'t returned it.' 
    });
  }

  const user = await User.findById(req.user.id);
  const activeCount = await Transaction.countDocuments({ user: req.user.id, status: 'active' });

  if (user.role === 'student' && activeCount >= 3) {
    return res.status(400).json({ message: 'Limit of 3 active books reached.' });
  }

  const book = await Book.findById(bookId);
  if (!book || book.availableCopies < 1) {
    return res.status(400).json({ message: 'Book not available' });
  }

  const transaction = new Transaction({ user: req.user.id, book: bookId, status: 'ordered', type: 'ordered' });
  await transaction.save();

  book.availableCopies -= 1;
  if (book.availableCopies === 0) book.status = 'unavailable';
  await book.save();

  await new Notification({ user: req.user.id, message: `Successfully ordered: ${book.title}` }).save();

  // Async background tasks
  const { sendOrderConfirmationEmail } = require('./utils/emailService');
  sendOrderConfirmationEmail(user, book, transaction).catch(console.error);

  res.status(201).json(transaction);
}));

app.put('/api/transactions/:id/return', authMiddleware, asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('book user');
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

  transaction.status = 'completed';
  transaction.returnDate = new Date();
  transaction.type = 'returned';

  if (transaction.user.role === 'student') {
    const timeDiff = transaction.returnDate.getTime() - transaction.expectedReturnDate.getTime();
    const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysOverdue > 0) {
      transaction.fineAmount = daysOverdue;
      const user = await User.findById(transaction.user._id);
      user.fineAmount += transaction.fineAmount;
      await user.save();
    }
  }

  await transaction.save();
  const book = await Book.findById(transaction.book._id);
  book.availableCopies += 1;
  book.status = 'available';
  await book.save();

  // Async background tasks
  const { sendReturnConfirmationEmail } = require('./utils/emailService');
  const { generateFinePDF } = require('./utils/pdfGenerator');

  generateFinePDF(transaction, transaction.user, book)
    .then(path => sendReturnConfirmationEmail(transaction.user, book, transaction, path))
    .catch(console.error);

  res.json(transaction);
}));

app.put('/api/transactions/:id/take', authMiddleware, asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('book user');
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

  transaction.status = 'active';
  transaction.type = 'issued';
  transaction.issuedDate = new Date();
  
  let expectedReturnDate = new Date();
  expectedReturnDate.setDate(expectedReturnDate.getDate() + (transaction.book.loanPeriod || 14));
  transaction.expectedReturnDate = expectedReturnDate;

  await transaction.save();
  await new Notification({ user: transaction.user._id, message: `Order processed for "${transaction.book.title}". Return by ${expectedReturnDate.toLocaleDateString()}.` }).save();

  res.json(transaction);
}));

// Notifications API
app.get('/api/notifications', authMiddleware, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(notifications);
}));

app.put('/api/notifications/:id/read', authMiddleware, asyncHandler(async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(notif);
}));

app.delete('/api/notifications/all', authMiddleware, asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user.id });
  res.json({ message: 'All notifications cleared' });
}));

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
}

module.exports = app; // Export for Vercel
