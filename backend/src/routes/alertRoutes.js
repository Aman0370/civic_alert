const express = require('express');
const router = express.Router();
const { publicActiveAlerts } = require('../controllers/notificationController');

router.get('/public', publicActiveAlerts);

module.exports = router;
