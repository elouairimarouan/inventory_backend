// models/StockMovement.js
const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['IN','OUT','ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  reason: { type: String, default: '' }, // e.g., sale, purchase, correction
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  reference: { type: String, default: '' }, // order id, invoice, note
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} } // any extra details
}, { timestamps: true });

// Prevent deletion in app rules (we won't expose delete endpoint)
module.exports = mongoose.model('StockMovement', stockMovementSchema);
