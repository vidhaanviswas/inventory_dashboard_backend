const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // used in Inventory.location
    type: {
      type: String,
      enum: ['Own', '3PL', 'Marketplace', 'Store'],
      default: 'Own',
    },
    city: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
