const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    type: {
      type: DataTypes.ENUM(
        'report_submitted',
        'report_under_review',
        'report_verified',
        'report_rejected',
        'area_alert'
      ),
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    reportId: { type: DataTypes.UUID, allowNull: true },
    alertId: { type: DataTypes.UUID, allowNull: true },
    severity: { type: DataTypes.STRING, allowNull: true },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: 'notifications',
    timestamps: true,
    indexes: [{ fields: ['userId'] }, { fields: ['read'] }],
  }
);

module.exports = Notification;
