require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const skuRoutes = require('./routes/skus');
const inventoryRoutes = require('./routes/inventory');
const warehouseRoutes = require('./routes/warehouses');
const alertsRoutes = require('./routes/alerts');
const statsRoutes = require('./routes/stats');

const app = express();

// ---------- CORS CONFIG ----------
const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://inventory-dashboard-frontend-dusky.vercel.app', // your Vercel app
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser tools (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn('❌ CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);


app.use(express.json());

// ---------- ROUTES ----------
app.use('api/auth', authRoutes);
app.use('api/skus', skuRoutes);
app.use('api/inventory', inventoryRoutes);
app.use('api/warehouses', warehouseRoutes);
app.use('api/stats', statsRoutes);
app.use('api/alerts', alertsRoutes);

// Simple health check for Render
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

const port = process.env.PORT || 4000;

// ---------- DB + SERVER START ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Mongo connection error:', err);
  });

module.exports = app; // optional, useful for testing
