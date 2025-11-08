const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/activityLogger');


const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, verif_password, role } = req.body;

    // 1️⃣ Validate required fields
    if (!first_name || !last_name || !email || !password || !verif_password)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== verif_password)
      return res.status(400).json({ message: "Passwords do not match" }); 

    // 2️⃣ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Prepare user data
    const userData = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: role || "employe",
    };

    // 5️⃣ Handle profile image upload (req.file from Multer)
    if (req.file) {
      userData.profile_image = req.file.path; // Cloudinary URL
      userData.profile_image_public_id = req.file.filename; // Cloudinary public_id
    }

    // 6️⃣ Save user
    const user = new User(userData);
    await user.save();

    await logActivity({
      userId: user._id,
      action: "CREATE",
      entity: "User",
      entityId: user._id,
      newData: userData,
      ipAddress: req.ip,
    });

    // 7️⃣ Send response
    res.status(201).json({
      message: "User created successfully",
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image || null,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔐 Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect Paasword' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    await logActivity({
      userId: user._id,
      action: "LOGIN",
      entity: "User",
      entityId: user._id,
      newData: { email: user.email, role: user.role , first_name :user.first_name, last_name : user.last_name},     
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: 'Authenticated',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 👇 New route: Get current logged-in user
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user comes from verifyToken middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login,getMe };
