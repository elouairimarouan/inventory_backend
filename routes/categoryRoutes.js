const express = require('express');
const router = express.Router();

const { createCategory,deleteCategory, getAllCategories} = require('../controllers/categoryController');
const {verifyTokenAndSuperAdmin}= require('../middlewares/verifyToken');

router.post('/', verifyTokenAndSuperAdmin, createCategory);
router.delete('/:id', verifyTokenAndSuperAdmin, deleteCategory);
router.get('/', verifyTokenAndSuperAdmin, getAllCategories);

module.exports = router;