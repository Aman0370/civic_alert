const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Report, Station, User, Notification } = require('../models');
const { distanceKm } = require('../utils/geo');
const { notifyUser } = require('../config/socket');

// @route POST /api/reports  (multipart/form-data, field "media")
const createReport = asyncHandler(async (req, res) => {
  const { title, description, category, lat, lng, address } = req.body;

  if (!title || !description || lat === undefined || lng === undefined) {
    res.status(400);
    throw new Error('Title, description, and location are required.');
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);

  // Assign to nearest station automatically
  const stations = await Station.findAll();
  let stationId = null;
  if (stations.length) {
    let nearest = stations[0];
    let minDist = Infinity;
    for (const s of stations) {
      const dist = distanceKm(latNum, lngNum, s.lat, s.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    }
    stationId = nearest.id;
  }

  let mediaUrl = null;
  let mediaType = 'none';
  if (req.file) {
    mediaUrl = req.file.path; // Cloudinary secure URL
    mediaType = req.file.mimetype?.startsWith('video') ? 'video' : 'image';
  }

  const report = await Report.create({
    reporterId: req.user.id,
    stationId,
    title,
    description,
    category: category || 'other',
    lat: latNum,
    lng: lngNum,
    address,
    mediaUrl,
    mediaType,
    status: 'pending',
  });

  await Notification.create({
    userId: req.user.id,
    type: 'report_submitted',
    title: 'Report submitted',
    message: `Your report "${title}" was sent to the nearest station and is awaiting review.`,
    reportId: report.id,
  });
  notifyUser(req.user.id, {
    type: 'report_submitted',
    title: 'Report submitted',
    message: `Your report "${title}" was sent to the nearest station and is awaiting review.`,
    reportId: report.id,
  });

  // Let the assigned station's dashboard know a new report is waiting
  if (stationId) {
    const { notifyStation } = require('../config/socket');
    notifyStation(stationId, 'report:new', { reportId: report.id, title, category: report.category });
  }

  res.status(201).json({ success: true, report });
});

// @route GET /api/reports/mine
const myReports = asyncHandler(async (req, res) => {
  const reports = await Report.findAll({
    where: { reporterId: req.user.id },
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, reports });
});

// @route GET /api/reports/:id
const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findByPk(req.params.id, {
    include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
  });
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  const isOwner = report.reporterId === req.user.id;
  const isAuthority = req.user.role === 'authority' || req.user.role === 'admin';
  if (!isOwner && !isAuthority) {
    res.status(403);
    throw new Error('You cannot view this report.');
  }
  res.json({ success: true, report });
});

// @route GET /api/reports/public/verified  (public safety map feed)
const publicVerifiedFeed = asyncHandler(async (req, res) => {
  const reports = await Report.findAll({
    where: { status: 'verified' },
    attributes: ['id', 'title', 'category', 'severity', 'lat', 'lng', 'createdAt', 'reviewedAt'],
    order: [['reviewedAt', 'DESC']],
    limit: 200,
  });
  res.json({ success: true, reports });
});

module.exports = { createReport, myReports, getReport, publicVerifiedFeed };
