const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../utils/token');
const { User } = require('../models');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized. Please log in.');
  }
  try {
    const decoded = verifyToken(header.split(' ')[1]);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['passwordHash', 'govIdHash'] },
    });
    if (!user) {
      res.status(401);
      throw new Error('User no longer exists.');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Session invalid or expired. Please log in again.');
  }
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('You do not have permission to perform this action.');
    }
    next();
  };

module.exports = { protect, restrictTo };
