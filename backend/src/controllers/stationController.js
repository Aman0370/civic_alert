const asyncHandler = require('express-async-handler');
const { Station } = require('../models');
const { distanceKm } = require('../utils/geo');

// @route GET /api/stations
const listStations = asyncHandler(async (req, res) => {
  const stations = await Station.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, stations });
});

// @route GET /api/stations/nearest?lat=&lng=
const nearestStation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    res.status(400);
    throw new Error('lat and lng query params are required.');
  }
  const stations = await Station.findAll();
  if (!stations.length) {
    res.status(404);
    throw new Error('No stations registered yet.');
  }
  let nearest = stations[0];
  let minDist = Infinity;
  for (const s of stations) {
    const dist = distanceKm(Number(lat), Number(lng), s.lat, s.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = s;
    }
  }
  res.json({ success: true, station: nearest, distanceKm: Number(minDist.toFixed(2)) });
});

// @route POST /api/stations (admin/seed use)
const createStation = asyncHandler(async (req, res) => {
  const { name, address, lat, lng, jurisdictionRadiusKm, contactPhone } = req.body;
  if (!name || lat === undefined || lng === undefined) {
    res.status(400);
    throw new Error('name, lat and lng are required.');
  }
  const station = await Station.create({
    name,
    address,
    lat,
    lng,
    jurisdictionRadiusKm: jurisdictionRadiusKm || 5,
    contactPhone,
  });
  res.status(201).json({ success: true, station });
});

module.exports = { listStations, nearestStation, createStation };
