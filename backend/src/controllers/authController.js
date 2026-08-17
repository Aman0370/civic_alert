const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Otp, Station } = require('../models');
const { isValidGovId, maskGovId, hashGovId } = require('../utils/govId');
const { sendOtpEmail } = require('../utils/email');
const { signToken } = require('../utils/token');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// @route POST /api/auth/register
// Step 1: validate details, create an UNVERIFIED user, email an OTP.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, govId, role, badgeNumber, stationId, authorityCode } = req.body;

  if (!name || !email || !password || !govId) {
    res.status(400);
    throw new Error('Name, email, password and government ID are required.');
  }

  if (!isValidGovId(govId)) {
    res.status(400);
    throw new Error('That government ID number does not look valid. Double-check the digits.');
  }

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const govIdHash = hashGovId(govId);
  const existingGovId = await User.findOne({ where: { govIdHash } });
  if (existingGovId) {
    res.status(409);
    throw new Error('This government ID is already registered to an account.');
  }

  let finalRole = 'citizen';
  if (role === 'authority') {
    if (!authorityCode || authorityCode !== process.env.AUTHORITY_SIGNUP_CODE) {
      res.status(403);
      throw new Error('Invalid authority registration code. Contact your station admin.');
    }
    if (!stationId || !badgeNumber) {
      res.status(400);
      throw new Error('Authority accounts require a station and badge number.');
    }
    const station = await Station.findByPk(stationId);
    if (!station) {
      res.status(400);
      throw new Error('Selected station does not exist.');
    }
    finalRole = 'authority';
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    govIdHash,
    govIdMasked: maskGovId(govId),
    role: finalRole,
    badgeNumber: finalRole === 'authority' ? badgeNumber : null,
    stationId: finalRole === 'authority' ? stationId : null,
    emailVerified: false,
  });

  const code = generateOtp();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  await Otp.create({
    email,
    codeHash,
    purpose: 'register',
    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000),
  });
  await sendOtpEmail(email, code);

  res.status(201).json({
    success: true,
    message: 'Registered. Check your email for a verification code.',
    userId: user.id,
    email: user.email,
  });
});

// @route POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400);
    throw new Error('Email and code are required.');
  }

  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const otp = await Otp.findOne({
    where: {
      email,
      codeHash,
      purpose: 'register',
      consumed: false,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otp) {
    res.status(400);
    throw new Error('That code is invalid or has expired. Request a new one.');
  }

  otp.consumed = true;
  await otp.save();

  const user = await User.findOne({ where: { email } });
  user.emailVerified = true;
  await user.save();

  const token = signToken(user);
  res.json({
    success: true,
    message: 'Email verified. You are now logged in.',
    token,
    user: sanitizeUser(user),
  });
});

// @route POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(404);
    throw new Error('No account found with that email.');
  }
  if (user.emailVerified) {
    res.status(400);
    throw new Error('This email is already verified.');
  }
  const code = generateOtp();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  await Otp.create({
    email,
    codeHash,
    purpose: 'register',
    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000),
  });
  await sendOtpEmail(email, code);
  res.json({ success: true, message: 'A new code has been sent to your email.' });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }
  if (!user.emailVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in.');
  }
  user.lastSeenAt = new Date();
  await user.save();

  const token = signToken(user);
  res.json({ success: true, token, user: sanitizeUser(user) });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

// @route PATCH /api/auth/location
const updateLiveLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    res.status(400);
    throw new Error('lat and lng must be numbers.');
  }
  req.user.liveLat = lat;
  req.user.liveLng = lng;
  req.user.lastSeenAt = new Date();
  await req.user.save();
  res.json({ success: true });
});

function sanitizeUser(user) {
  const plain = user.toJSON ? user.toJSON() : user;
  const { passwordHash, govIdHash, ...safe } = plain;
  return safe;
}

module.exports = { register, verifyOtp, resendOtp, login, getMe, updateLiveLocation };
