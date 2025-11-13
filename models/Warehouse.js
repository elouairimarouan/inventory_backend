// models/Warehouse.js
const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, default: '' },
  contact: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
