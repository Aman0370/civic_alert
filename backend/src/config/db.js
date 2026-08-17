const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions:
        process.env.NODE_ENV === 'production'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[db] PostgreSQL connection established.');
  } catch (err) {
    console.error('[db] Unable to connect to the database:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
