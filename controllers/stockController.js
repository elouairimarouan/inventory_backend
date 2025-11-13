const Product = require('../models/Product');
const logActivity = require('../utils/activityLogger');
const StockMovement = require('../models/StockMouvement');
const paginate = require('../utils/paginate');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../config/pagination');

const createMovement = async (req, res) => {
  try {
    const { productId, type, quantity, reason = '', reference = '', metadata = {} } = req.body;

    // Validation des champs requis
    if (!productId || !type || typeof quantity === 'undefined') {
      return res.status(400).json({ success: false, message: 'productId, type and quantity are required' });
    }

    // Correction de "ADJUSTEMENT" → "ADJUSTMENT"
    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid movement type (IN/OUT/ADJUSTMENT)' });
    }

    const q = Number(quantity);
    if (q <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    // Vérifie si le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Vérifie le stock avant une sortie
    if (type === 'OUT' && product.quantity < q) {
      return res.status(400).json({ success: false, message: 'Insufficient stock for OUT movement' });
    }

    // Crée un mouvement de stock
    const movement = await StockMovement.create({
      product: product._id,
      type,
      quantity: q,
      reason,
      reference,
      metadata,
      createdBy: req.user?.id
    });

    // Met à jour la quantité du produit
    if (type === 'IN') product.quantity += q;
    else if (type === 'OUT') product.quantity -= q;
    else if (type === 'ADJUSTMENT') {
      if (metadata && metadata.adjustmentMode === 'SET') {
        product.quantity = q; // Set absolu
      } else {
        product.quantity += q; // Delta
      }
    }

    if (product.quantity < 0) product.quantity = 0; // Sécurité
    await product.save();

    // Journalise l'activité
    await logActivity({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'StockMovement',
      entityId: movement._id,
      newData: { product: product._id, type: movement.type, quantity: movement.quantity },
      ipAddress: req.ip,
      fullName: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim()
    });

    // Alerte stock faible
    if (product.lowStockThreshold && product.quantity <= product.lowStockThreshold) {
      console.warn(`Low stock alert: Product ${product.name} (qty=${product.quantity}) <= threshold ${product.lowStockThreshold}`);
      // Tu peux ici créer une notification si besoin
    }

    res.status(201).json({ success: true, movement, product });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getMovements = async (req, res) => {
  try {
    const { productId, type, startDate, endDate, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;
    const query = {};

    if (productId) query.product = productId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const result = await paginate(StockMovement, query, {
      page,
      limit,
      sort: { createdAt: -1 }
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = { createMovement, getMovements };
