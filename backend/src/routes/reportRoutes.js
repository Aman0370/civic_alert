const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createReport,
  myReports,
  getReport,
  publicVerifiedFeed,
} = require('../controllers/reportController');

router.get('/public/verified', publicVerifiedFeed);
router.post('/', protect, restrictTo('citizen'), upload.single('media'), createReport);
router.get('/mine', protect, restrictTo('citizen'), myReports);
router.get('/:id', protect, getReport);

module.exports = router;
