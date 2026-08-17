const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Report, Alert, User, Notification, Station } = require('../models');
const { radiusForSeverity, expiryForSeverity, distanceKm } = require('../utils/geo');
const { notifyUser, broadcastAlert } = require('../config/socket');

// @route GET /api/authority/queue?status=pending
const getQueue = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;
  // Authorities only see reports assigned to their own station (admins see all)
  if (req.user.role === 'authority') where.stationId = req.user.stationId;

  const reports = await Report.findAll({
    where,
    include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'ASC']],
  });
  res.json({ success: true, reports });
});

// @route PATCH /api/authority/reports/:id/start-review
const startReview = asyncHandler(async (req, res) => {
  const report = await Report.findByPk(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  if (report.status !== 'pending') {
    res.status(400);
    throw new Error(`Report is already ${report.status}.`);
  }
  report.status = 'under_review';
  report.reviewedBy = req.user.id;
  await report.save();

  await Notification.create({
    userId: report.reporterId,
    type: 'report_under_review',
    title: 'Investigation started',
    message: `Your report "${report.title}" is now under review by ${req.user.station?.name || 'the station'}.`,
    reportId: report.id,
  });
  notifyUser(report.reporterId, {
    type: 'report_under_review',
    title: 'Investigation started',
    message: `Your report "${report.title}" is now under review.`,
    reportId: report.id,
  });

  res.json({ success: true, report });
});

// @route PATCH /api/authority/reports/:id/verify
// body: { severity: 'low'|'medium'|'high'|'critical', note }
const verifyReport = asyncHandler(async (req, res) => {
  const { severity, note } = req.body;
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(severity)) {
    res.status(400);
    throw new Error('Severity must be one of: low, medium, high, critical.');
  }

  const report = await Report.findByPk(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  if (report.status === 'verified' || report.status === 'rejected') {
    res.status(400);
    throw new Error(`Report is already ${report.status}.`);
  }

  report.status = 'verified';
  report.severity = severity;
  report.reviewedBy = req.user.id;
  report.reviewedAt = new Date();
  report.reviewNote = note || null;
  await report.save();

  // Generate an area alert scaled to severity
  const radiusKm = radiusForSeverity(severity);
  const alert = await Alert.create({
    reportId: report.id,
    stationId: report.stationId,
    severity,
    category: report.category,
    headline: `${labelForCategory(report.category)} reported nearby`,
    lat: report.lat,
    lng: report.lng,
    radiusKm,
    active: true,
    expiresAt: expiryForSeverity(severity),
  });

  // Notify the original reporter
  await Notification.create({
    userId: report.reporterId,
    type: 'report_verified',
    title: 'Investigation successful',
    message: `Your report "${report.title}" was verified. Severity: ${severity}. A ${radiusKm}km alert has been issued to nearby citizens.`,
    reportId: report.id,
    alertId: alert.id,
    severity,
  });
  notifyUser(report.reporterId, {
    type: 'report_verified',
    title: 'Investigation successful',
    message: `Your report was verified as ${severity} severity. Nearby citizens have been alerted.`,
    reportId: report.id,
    alertId: alert.id,
  });

  // Push area alert to every citizen whose last known live location falls
  // inside the radius, plus broadcast to the live public map feed.
  const nearbyCitizens = await User.findAll({
    where: {
      role: 'citizen',
      liveLat: { [Op.ne]: null },
      liveLng: { [Op.ne]: null },
    },
  });
  const affected = nearbyCitizens.filter(
    (u) => distanceKm(report.lat, report.lng, u.liveLat, u.liveLng) <= radiusKm
  );
  for (const citizen of affected) {
    await Notification.create({
      userId: citizen.id,
      type: 'area_alert',
      title: alert.headline,
      message: `A ${severity} severity incident was confirmed within ${radiusKm}km of your area.`,
      reportId: report.id,
      alertId: alert.id,
      severity,
    });
    notifyUser(citizen.id, {
      type: 'area_alert',
      title: alert.headline,
      message: `A ${severity} severity incident was confirmed within ${radiusKm}km of your area.`,
      alertId: alert.id,
      severity,
      lat: report.lat,
      lng: report.lng,
      radiusKm,
    });
  }

  broadcastAlert({
    id: alert.id,
    reportId: report.id,
    category: report.category,
    severity,
    headline: alert.headline,
    lat: report.lat,
    lng: report.lng,
    radiusKm,
    expiresAt: alert.expiresAt,
  });

  res.json({ success: true, report, alert, citizensAlerted: affected.length });
});

// @route PATCH /api/authority/reports/:id/reject
const rejectReport = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const report = await Report.findByPk(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }
  if (report.status === 'verified' || report.status === 'rejected') {
    res.status(400);
    throw new Error(`Report is already ${report.status}.`);
  }
  report.status = 'rejected';
  report.reviewedBy = req.user.id;
  report.reviewedAt = new Date();
  report.reviewNote = reason || 'Could not be verified.';
  await report.save();

  await Notification.create({
    userId: report.reporterId,
    type: 'report_rejected',
    title: 'Report not verified',
    message: `Your report "${report.title}" could not be verified. Reason: ${report.reviewNote}`,
    reportId: report.id,
  });
  notifyUser(report.reporterId, {
    type: 'report_rejected',
    title: 'Report not verified',
    message: `Your report "${report.title}" could not be verified.`,
    reportId: report.id,
  });

  res.json({ success: true, report });
});

// @route GET /api/authority/alerts/active
const activeAlerts = asyncHandler(async (req, res) => {
  const where = { active: true, expiresAt: { [Op.gt]: new Date() } };
  if (req.user.role === 'authority') where.stationId = req.user.stationId;
  const alerts = await Alert.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json({ success: true, alerts });
});

function labelForCategory(cat) {
  const map = {
    theft: 'Theft',
    assault: 'Assault',
    vandalism: 'Vandalism',
    suspicious_activity: 'Suspicious activity',
    accident: 'Accident',
    fire: 'Fire',
    public_disturbance: 'Public disturbance',
    other: 'Incident',
  };
  return map[cat] || 'Incident';
}

module.exports = { getQueue, startReview, verifyReport, rejectReport, activeAlerts };
