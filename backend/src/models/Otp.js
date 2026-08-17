const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Otp = sequelize.define(
  'Otp',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: { type: DataTypes.STRING, allowNull: false },
    codeHash: { type: DataTypes.STRING, allowNull: false },
    purpose: {
      type: DataTypes.ENUM('register', 'login_2fa'),
      defaultValue: 'register',
    },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    consumed: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'otps', timestamps: true }
);

module.exports = Otp;
