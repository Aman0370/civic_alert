require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
require('./models'); // registers associations
const { initSocket } = require('./config/socket');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const stationRoutes = require('./routes/stationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'CivicAlert API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertRoutes);

app.use(notFound);
app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  // sync() creates tables if they don't exist - fine for dev, use migrations in prod
  await sequelize.sync();
  httpServer.listen(PORT, () => {
    console.log(`[server] CivicAlert API listening on port ${PORT}`);
  });
}

start();

module.exports = { app, httpServer };
