const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.resources({ max_results: 1 }, (error, result) => {
  if (error) {
    console.error("Cloudinary connection error:", error);
  } else {
    console.log("Cloudinary connected successfully!");
    console.log(result);
  }
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "inventory",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  },
});

const photoUpload = multer({ storage });

module.exports = photoUpload;
