const bcrypt = require('bcrypt');
const User = require('../models/User');

const createSuperAdmin = async () => {
  const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
    const superAdmin = new User({
      first_name: 'System',
      last_name: 'Admin',
      email: 's@s.com',
      password: hashedPassword, // use hashed password
      role: 'superadmin',
    });
    await superAdmin.save();
    console.log("👑 Super Admin created (email: superadmin@system.com)");
  } else {
    console.log("👑 Super Admin already exists");
  }
};

module.exports = createSuperAdmin;
