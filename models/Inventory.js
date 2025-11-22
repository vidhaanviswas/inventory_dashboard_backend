// server/models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },         // e.g. "SKU-001"
    location: { type: String, required: true },    // e.g. "WH-01 (Own)"
    available: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
