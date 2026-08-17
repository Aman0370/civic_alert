const express = require('express');
const router = express.Router();
const { listStations, nearestStation, createStation } = require('../controllers/stationController');

router.get('/', listStations);
router.get('/nearest', nearestStation);
router.post('/', createStation); // in production this would be admin-protected

module.exports = router;
