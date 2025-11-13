const Product = require('../models/Product');
const logActivity = require('../utils/activityLogger');
const paginate = require('../utils/paginate');
const { DEFAULT_PAGE , DEFAULT_LIMIT } = require('../config/pagination');
const StockMovement = require('../models/StockMouvement');
const Category = require('../models/Category');

const addProduct = async (req, res) => {
  try {
    const { 
      name, sku, category, description, quantity = 0, unit, 
      price = 0, supplier, status, lowStockThreshold, 
      averageDailyUsage, reorderDelay 
    } = req.body;

    if (!name || !sku || !category) {
      return res.status(400).json({ success: false, message: 'Name, SKU and Category are required' });
    }

    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(409).json({ success: false, message: 'Product with this SKU already exists' });
    }

    // Compute low stock threshold dynamically if not provided
    let threshold = lowStockThreshold 
      ? Number(lowStockThreshold) 
      : (averageDailyUsage && reorderDelay)
        ? Math.ceil(Number(averageDailyUsage) * Number(reorderDelay))
        : undefined;

    const newProduct = new Product({
      name,
      sku,
      category,
      description,
      quantity: Math.max(0, Number(quantity)),
      unit,
      price: Math.max(0, Number(price)),
      supplier,
      lowStockThreshold: threshold,
      averageDailyUsage: averageDailyUsage ? Number(averageDailyUsage) : 0,
      reorderDelay: reorderDelay ? Number(reorderDelay) : 0,
      status,
      createdBy: req.user?.id
    });

    await newProduct.save();

    // Record initial stock movement
    if (newProduct.quantity > 0) {
      await StockMovement.create({
        product: newProduct._id,
        type: 'IN',
        quantity: newProduct.quantity,
        reason: 'Initial stock on product creation',
        createdBy: req.user?.id,
        metadata: { reasonCode: 'INIT_CREATION' }
      });
    }

    await logActivity({
      userId: req.user?.id,
      action: 'CREATE',
      entity: 'Product',
      entityId: newProduct._id,
      newData: { 
        name: newProduct.name, 
        sku: newProduct.sku, 
        quantity: newProduct.quantity,
        lowStockThreshold: newProduct.lowStockThreshold,
        averageDailyUsage: newProduct.averageDailyUsage,
        reorderDelay: newProduct.reorderDelay,
        supplier: newProduct.supplier
      },
      ipAddress: req.ip,
      fullName: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim()
    });

    const populatedProduct = await newProduct.populate('category', 'name');

    res.status(201).json({ success: true, product: populatedProduct });

  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Prevent SKU change
    if ('sku' in update && update.sku !== product.sku) {
      return res.status(400).json({ success: false, message: 'SKU cannot be modified after creation' });
    }

    // Prevent direct quantity updates
    if ('quantity' in update) {
      return res.status(400).json({ success: false, message: 'Quantity must be adjusted via stock movements' });
    }

    // Prevent direct price updates
    if ('price' in update) {
      return res.status(400).json({ success: false, message: 'Price must be updated via dedicated price update endpoint' });
    }

    // Validate category if changed
    if (update.category && update.category.toString() !== product.category.toString()) {
      const cat = await Category.findById(update.category);
      if (!cat) return res.status(400).json({ success: false, message: 'Category not found' });
    }

    // Keep old data for logging
    const oldData = {
      name: product.name,
      description: product.description,
      unit: product.unit,
      supplier: product.supplier,
      category: product.category,
      lowStockThreshold: product.lowStockThreshold
    };

    // Apply updates
    Object.assign(product, update);
    await product.save();

    // Log activity
    await logActivity({
      userId: req.user?.id,
      action: 'UPDATE',
      entity: 'Product',
      entityId: product._id,
      oldData,
      newData: update,
      ipAddress: req.ip,
      fullName: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim()
    });

    res.json({ success: true, product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


const deleteProduct = async(req, res) =>{

    try {
        const {id} = req.params;
        const product = await Product.findById(id);
        if (!product){
            return res.status(404).json({ success: false, message: 'Product not found'});
        };

        const mouvements = await StockMouvement.findOne({ product: id});
        if (mouvements){
            return res.status(400).json({ success: false, message: 'Cannot delete product with stock history. Marked as INACTIVE instead'});
        }

        product.is_active = false;
        await product.save();

        await logActivity({
          userId: req.user?.id,
          action: 'DEACTIVATE',
          entity: 'Product',
          entityId: id,
          oldData: { name: product.name, sku: product.sku },
          ipAddress: req.ip,
          fullName: `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
        });

        res.json({ success: true, message: 'Product marked as inactive' });

    
    } catch(error){
        res.status(500).json({ success : false, message: 'server error', error: error.message});
    }
}

const getProductById = async (req, res) =>{
    try {
        const {id} = req.params;
        const product = await Product.findOne({_id: id, isActive: true}).populate('category', 'name');
        if (!product){
            return res.status(404).json({ success: false, message: 'Product not found'});
        };
        return res.json({ success: true, product});
    }catch(error){
        res.status(500).json({ success : false, message: 'server error', error: error.message});
    }
};

const getAllProducts = async (req, res) => {
  try {
    const { search = '', page, limit, category, active } = req.query;

    const query = [];

    // Search by name, SKU, description, supplier
    if (search) {
      query.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { supplier: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Filter by category
    if (category) query.push({ category });

    // Filter by active/inactive products
    if (active === 'true') query.push({ isActive: true });
    else if (active === 'false') query.push({ isActive: false });
    // If active param is missing or invalid, return all products

    const finalQuery = query.length ? { $and: query } : {};

    // Paginate results
    const result = await paginate(Product, finalQuery, {
      page: page || DEFAULT_PAGE,
      limit: limit || DEFAULT_LIMIT,
      sort: { createdAt: -1 },
      populate: 'category'
    });

    res.status(200).json({ success: true, ...result });

  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
 
module.exports = {
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getAllProducts
};