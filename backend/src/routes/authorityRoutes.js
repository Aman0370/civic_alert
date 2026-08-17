const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getQueue,
  startReview,
  verifyReport,
  rejectReport,
  activeAlerts,
} = require('../controllers/authorityController');

router.use(protect, restrictTo('authority', 'admin'));

router.get('/queue', getQueue);
router.patch('/reports/:id/start-review', startReview);
router.patch('/reports/:id/verify', verifyReport);
router.patch('/reports/:id/reject', rejectReport);
router.get('/alerts/active', activeAlerts);

module.exports = router;
