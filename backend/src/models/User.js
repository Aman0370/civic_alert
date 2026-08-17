const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    // We NEVER store the raw government ID number. Only a salted hash for
    // uniqueness checks, plus a masked display value (e.g. XXXX-XXXX-1234).
    govIdHash: { type: DataTypes.STRING, allowNull: false, unique: true },
    govIdMasked: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('citizen', 'authority', 'admin'),
      defaultValue: 'citizen',
    },
    badgeNumber: { type: DataTypes.STRING, allowNull: true }, // authority only
    stationId: { type: DataTypes.UUID, allowNull: true }, // authority only
    liveLat: { type: DataTypes.FLOAT, allowNull: true },
    liveLng: { type: DataTypes.FLOAT, allowNull: true },
    lastSeenAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [{ fields: ['email'] }, { fields: ['role'] }],
  }
);

module.exports = User;
