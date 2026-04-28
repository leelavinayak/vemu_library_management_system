const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { id: user.id, role: user.role };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, year: user.year, branch: user.branch, section: user.section, collegeName: user.collegeName, collegeId: user.collegeId } });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, year, branch, section, collegeName, collegeId, mobileNumber } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password, role, year, branch, section, collegeName, collegeId, mobileNumber });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Create Welcome Notification
        const welcomeNotification = new Notification({
            user: user._id,
            message: `Welcome to the Library Management System, ${user.name}! We're glad to have you.`
        });
        await welcomeNotification.save();

        // Send Welcome Email
        const { sendWelcomeEmail } = require('../utils/emailService');
        sendWelcomeEmail(user);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send OTP Email
        const { sendOTPEmail } = require('../utils/emailService');
        await sendOTPEmail(user, otp);

        // Send OTP SMS
        const { sendOTPSMS } = require('../utils/smsService');
        await sendOTPSMS(user, otp);

        res.json({ message: 'Verification code has been sent to your email and mobile number.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now login.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
