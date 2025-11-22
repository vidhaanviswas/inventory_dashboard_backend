// server/models/Sku.js
const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true }, // e.g., "SKU-001"
    name: { type: String, required: true },              // e.g., "Red T-Shirt"
    category: { type: String, required: true },          // e.g., "Apparel"
    status: { type: String, enum: ['Active', 'Draft'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sku', skuSchema);
