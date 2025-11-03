const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const upload = require("../middlewares/photoUpload");
const { verifyTokenAndSuperAdmin,verifyToken } = require('../middlewares/verifyToken');
const { logout } = require('../controllers/userController');


router.post('/login', login);
router.post('/logout', verifyToken,logout);
router.post('/register', verifyTokenAndSuperAdmin,upload.single("profile_image") ,register);
router.get('/me', verifyToken, getMe); // 👈 Protected route


module.exports = router;
