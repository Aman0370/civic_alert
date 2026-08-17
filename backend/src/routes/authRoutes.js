const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateLiveLocation,
} = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.patch('/location', protect, updateLiveLocation);

module.exports = router;
