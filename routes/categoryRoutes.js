const express = require('express');
const router = express.Router();

const { createCategory} = require('../controllers/categoryController');
const {verifyTokenAndSuperAdmin}= require('../middlewares/verifyToken');

router.post('/', verifyTokenAndSuperAdmin, createCategory)

module.exports = router;