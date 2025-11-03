// utils/publicIdCloudinary.js

/**
 * Extracts the Cloudinary public_id from a full URL
 * Works for URLs with folders, version numbers, and file extensions
 *
 * @param {string} url - The full Cloudinary URL
 * @returns {string|null} public_id or null if invalid
 */
function getPublicIdFromUrl(url) {
    if (!url) return null;
  
    try {
      // 1️⃣ Get the part after '/upload/'
      const path = url.split("/upload/")[1];
      if (!path) return null;
  
      // 2️⃣ Remove version prefix if present (e.g., v1700000000)
      let parts = path.split("/");
      if (parts[0].startsWith("v") && !isNaN(parts[0].slice(1))) {
        parts.shift();
      }
  
      // 3️⃣ Remove file extension from last segment
      const last = parts.pop();
      const lastDot = last.lastIndexOf(".");
      const lastWithoutExt = lastDot !== -1 ? last.substring(0, lastDot) : last;
      parts.push(lastWithoutExt);
  
      // 4️⃣ Join parts back
      return parts.join("/");
    } catch (err) {
      console.error("Error decoding public_id from URL:", err);
      return null;
    }
  }
  
  module.exports = { getPublicIdFromUrl };
  