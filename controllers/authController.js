const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
  try {
    const {first_name, last_name, email, password ,verif_password, role}= req.body;
    if ( !first_name || !last_name || !email || !password || !verif_password) return res.status(400).json({message:" all field required"});
    if (password != verif_password) return res.status(400).json({message:'Passwords do not match'})
    const existingUser = await User.findOne({email});
    if (existingUser) return res.status(400).json({message: 'email already exist'});
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role : role || 'employe'
    });
    await user.save();
    res.status(201).json({message:'User created succesfully'})


  }catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  console.log("📩 Login request received:", req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { login , register};
