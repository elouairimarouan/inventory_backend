const express = require('express');
const router = express.Router();

const { createCategory,deleteCategory} = require('../controllers/categoryController');
const {verifyTokenAndSuperAdmin}= require('../middlewares/verifyToken');

router.post('/', verifyTokenAndSuperAdmin, createCategory);
router.delete('/:id', verifyTokenAndSuperAdmin, deleteCategory);

module.exports = router;