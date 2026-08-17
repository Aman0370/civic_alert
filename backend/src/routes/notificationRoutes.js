const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { myNotifications, markRead, markAllRead } = require('../controllers/notificationController');

router.use(protect);
router.get('/', myNotifications);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

module.exports = router;
