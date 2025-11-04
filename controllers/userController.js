const User = require('../models/User');
const bcrypt = require("bcryptjs");
const { getPublicIdFromUrl } = require("../utils/publicIdCloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user
// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Prepare fields to update
    const fieldsToUpdate = {
      first_name: req.body.first_name?.trim(),
      last_name: req.body.last_name?.trim(),
      email: req.body.email?.toLowerCase().trim(),
      role: req.body.role,
      is_active: req.body.is_active // add this line
    };

    // Email uniqueness check
    if (fieldsToUpdate.email && fieldsToUpdate.email !== user.email) {
      const existingUser = await User.findOne({ email: fieldsToUpdate.email });
      if (existingUser) return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Password hashing
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(req.body.password, salt);
    }

    // Handle new profile image upload
    if (req.file) {
      // Delete old image from Cloudinary
      const oldPublicId = user.profile_image_public_id || getPublicIdFromUrl(user.profile_image);
      if (oldPublicId) {
        try {
          const result = await cloudinary.uploader.destroy(oldPublicId);
          console.log("Old Cloudinary image deleted:", result);
        } catch (err) {
          console.error("Error deleting old Cloudinary image:", err);
        }
      }

      // Save new image info
      fieldsToUpdate.profile_image = req.file.path;           // Cloudinary URL
      fieldsToUpdate.profile_image_public_id = req.file.filename; // Cloudinary public_id
    }

    // Remove undefined or empty fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (!fieldsToUpdate[key]) delete fieldsToUpdate[key];
    });

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    const { password, __v, profile_image_public_id, ...userData } = updatedUser.toObject();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get Cloudinary public_id from DB or decode URL
    const publicId = user.profile_image_public_id || getPublicIdFromUrl(user.profile_image);

    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary image deleted:", result);
      } catch (err) {
        console.error("Error deleting Cloudinary image:", err);
      }
    }

    // Delete user from DB
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const logout = (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};



module.exports = { getAllUsers, updateUser ,deleteUser ,logout };
