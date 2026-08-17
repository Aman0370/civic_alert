const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define(
  'Report',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporterId: { type: DataTypes.UUID, allowNull: false },
    stationId: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: {
      type: DataTypes.ENUM(
        'theft',
        'assault',
        'vandalism',
        'suspicious_activity',
        'accident',
        'fire',
        'public_disturbance',
        'other'
      ),
      defaultValue: 'other',
    },
    mediaUrl: { type: DataTypes.STRING, allowNull: true },
    mediaType: {
      type: DataTypes.ENUM('image', 'video', 'none'),
      defaultValue: 'none',
    },
    lat: { type: DataTypes.FLOAT, allowNull: false },
    lng: { type: DataTypes.FLOAT, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'under_review', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: true,
    },
    reviewedBy: { type: DataTypes.UUID, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
    reviewNote: { type: DataTypes.STRING, allowNull: true },
    isAnonymousToPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'reports',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['severity'] },
      { fields: ['reporterId'] },
      { fields: ['stationId'] },
    ],
  }
);

module.exports = Report;
