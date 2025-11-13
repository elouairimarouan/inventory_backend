// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },
  quantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'pcs' }, // piece, kg, L, etc.
  price: { type: Number, default: 0, min: 0 }, // unit price
  supplier: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE','INACTIVE'], default: 'ACTIVE' },
  lowStockThreshold: { type: Number, default: 0 }, // alert threshold
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: {type: Boolean, default: true},
}, { timestamps: true });

// Indexes for performance on search and SKU uniqueness
productSchema.index({ name: 'text', description: 'text', sku: 1 });
productSchema.index({ sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
