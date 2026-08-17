const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Notification, Alert } = require('../models');

// @route GET /api/notifications
const myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
  res.json({ success: true, notifications });
});

// @route PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notif) {
    res.status(404);
    throw new Error('Notification not found.');
  }
  notif.read = true;
  await notif.save();
  res.json({ success: true, notification: notif });
});

// @route PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.update({ read: true }, { where: { userId: req.user.id, read: false } });
  res.json({ success: true });
});

// @route GET /api/alerts/public - active alerts for the live map, no auth required
const publicActiveAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.findAll({
    where: { active: true, expiresAt: { [Op.gt]: new Date() } },
    order: [['createdAt', 'DESC']],
    limit: 200,
  });
  res.json({ success: true, alerts });
});

module.exports = { myNotifications, markRead, markAllRead, publicActiveAlerts };
