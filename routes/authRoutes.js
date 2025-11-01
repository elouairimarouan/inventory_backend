const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { verifyTokenAndSuperAdmin } = require('../middlewares/verifyToken');

router.post('/login', login);
router.post('/register', verifyTokenAndSuperAdmin ,register);

module.exports = router;
