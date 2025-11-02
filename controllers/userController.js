const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    // ✅ Fetch users and exclude passwords
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { getAllUsers };
