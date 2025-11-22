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
// demand-trend route removed


const app = express();

// middlewares
app.use(
    cors({
        origin: 'http://localhost:5173', // Vite default port
        credentials: true,
    })
);
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertsRoutes);
// demand-trend route removed

const port = process.env.PORT || 4000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(port, () => {
            console.log(`✅ Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Mongo connection error:', err);
    });
