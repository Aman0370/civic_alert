const { sequelize } = require('../config/db');
const User = require('./User');
const Station = require('./Station');
const Report = require('./Report');
const Alert = require('./Alert');
const Notification = require('./Notification');
const Otp = require('./Otp');

// Associations
User.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });
Station.hasMany(User, { foreignKey: 'stationId', as: 'officers' });

Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });

Report.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });
Station.hasMany(Report, { foreignKey: 'stationId', as: 'reports' });

Report.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

Alert.belongsTo(Report, { foreignKey: 'reportId', as: 'report' });
Report.hasOne(Alert, { foreignKey: 'reportId', as: 'alert' });

Alert.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

module.exports = { sequelize, User, Station, Report, Alert, Notification, Otp };
