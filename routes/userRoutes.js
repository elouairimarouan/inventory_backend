const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');
const { verifyTokenAndSuperAdmin } = require('../middlewares/verifyToken');

router.get("/", verifyTokenAndSuperAdmin, getAllUsers);

module.exports = router;


