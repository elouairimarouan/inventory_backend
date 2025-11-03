const express = require('express');
const router = express.Router();
const { getAllUsers,updateUser } = require('../controllers/userController');
const { verifyTokenAndSuperAdmin } = require('../middlewares/verifyToken');
const photoUpload = require("../middlewares/photoUpload");

router.get("/", verifyTokenAndSuperAdmin, getAllUsers);
router.put("/:id", verifyTokenAndSuperAdmin, photoUpload.single("profile_image"), updateUser);
  

module.exports = router;


