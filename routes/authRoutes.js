const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { verifyTokenAndSuperAdmin,verifyToken } = require('../middlewares/verifyToken');


router.post('/login', login);
router.post('/register', verifyTokenAndSuperAdmin ,register);
router.get('/me', verifyToken, getMe); // 👈 Protected route


module.exports = router;
