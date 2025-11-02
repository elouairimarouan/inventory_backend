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
    default: 'https://res.cloudinary.com/demo/image/upload/v1700000000/default-avatar.png'
  }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);