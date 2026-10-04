import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { checkConnection } from './db/pool.js';
import dashboardRoutes from './routes/dashboard.js';
import studentRoutes from './routes/students.js';
import transportRoutes from './routes/transport.js';
import routeRoutes from './routes/routes.js';
import busRoutes from './routes/buses.js';
import pickupPointRoutes from './routes/pickupPoints.js';
import pickupRecordRoutes from './routes/pickupRecords.js';
import feeRoutes from './routes/fees.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check — verifies both the server and the MySQL connection
app.get('/api/health', async (req, res) => {
  try {
    await checkConnection();
    res.json({ success: true, server: 'running', database: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ success: false, server: 'running', database: 'disconnected', message: 'Unable to connect to database' });
  }
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/pickup-points', pickupPointRoutes);
app.use('/api/pickup-records', pickupRecordRoutes);
app.use('/api/transport-fees', feeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`\n🚍  Transport Dashboard API running on http://localhost:${PORT}`);
  try {
    await checkConnection();
    console.log('✅  MySQL connection established\n');
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message, '\n');
  }
});
