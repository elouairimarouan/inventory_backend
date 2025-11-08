const mongoose = require('mongoose');

const itemschema = new mongoose.Schema({
    name : { type:String,  required:true , unique:true,},
    sku : {type:String ,unique :true, index:true},
    uom: { type: String, default: "pcs" },
    is_batch_tracked: { type: Boolean, default: false },
    quantity:{type: Number, default:0},
    min_quantity: { type: Number, default: 0 },
    price: {type: Number},
    location: {type: String},
    image: {type: String},
    category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product',itemschema)