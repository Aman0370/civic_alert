const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Station = sequelize.define(
  'Station',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    lat: { type: DataTypes.FLOAT, allowNull: false },
    lng: { type: DataTypes.FLOAT, allowNull: false },
    jurisdictionRadiusKm: { type: DataTypes.FLOAT, defaultValue: 5 },
    contactPhone: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'stations', timestamps: true }
);

module.exports = Station;
