const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name:{
    type : String,
    required: true,
  },
  last_name:{
    type : String,
    required: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role:{
    type: String,
    enum:['employe','admin','superadmin'],
    required:true,
    default:'employe'
  },
  is_active:{
    type: Boolean,
    default: true
  },
  profile_image:{
    type :String,
    default: 'https://res.cloudinary.com/dvq9wue5g/image/upload/v1762185483/inventory/e9llidhok5s8fpn954sk.jpg'
  }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);