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

const updateUser = async(req,res) =>{
    try{
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { first_name, last_name, email, password, role} = req.body || {};

        user.first_name = first_name || user.first_name;
        user.last_name = last_name || user.last_name;
        user.email = email || user.email;
        user.role = role || user.role;

        if (req.file && req.file.path) {
            user.profile_image = req.file.path; // Cloudinary URL
        }
        
      


        if (password) {
            user.password = await bcrypt.hash(password, 10);
          }

        await user.save();
        const { password: pw, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            success:true,
            user: userWithoutPassword
        })
    

    }catch(error){
        res.status(500).json({ 
            message: 'Server error',
            error: error.message})
    }
}

module.exports = { getAllUsers,updateUser };
