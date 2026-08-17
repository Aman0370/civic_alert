const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Severity -> radius mapping is enforced at creation time (see utils/geo.js)
const Alert = sequelize.define(
  'Alert',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reportId: { type: DataTypes.UUID, allowNull: false },
    stationId: { type: DataTypes.UUID, allowNull: true },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    category: { type: DataTypes.STRING, allowNull: true },
    headline: { type: DataTypes.STRING, allowNull: false },
    lat: { type: DataTypes.FLOAT, allowNull: false },
    lng: { type: DataTypes.FLOAT, allowNull: false },
    radiusKm: { type: DataTypes.FLOAT, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: 'alerts',
    timestamps: true,
    indexes: [{ fields: ['active'] }, { fields: ['severity'] }],
  }
);

module.exports = Alert;
