const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { verifyTokenAndSuperAdmin } = require('../middlewares/verifyToken');
const upload = require("../middlewares/photoUpload");

router.get("/", verifyTokenAndSuperAdmin, getAllUsers);
router.put("/:id", verifyTokenAndSuperAdmin, upload.single("profile_image"), updateUser);
router.delete("/:id", verifyTokenAndSuperAdmin, deleteUser);


module.exports = router;
