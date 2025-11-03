const User = require("../models/User");


const getAllUsers = async (req, res) => {
  try {
    // ✅ Fetch users and exclude passwords
    const users = await User.find().select('-password');

    res.status(200).json({
      success: 'nothig',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Extract only the fields present in the request body
    const { first_name, last_name, email, password, role } = req.body ?? {};

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Handle profile image upload (optional)
    if (req.file && req.file.path) {
      user.profile_image = req.file.path; // Cloudinary URL
    }

    // Hash password if it's provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const { password: pw, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = { getAllUsers,updateUser };
