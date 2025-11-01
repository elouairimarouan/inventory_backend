const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (authToken && authToken.startsWith("Bearer ")) {
    const token = authToken.split(" ")[1];
    try {
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedPayload;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token, access denied" });
    }
  } else {
    return res.status(401).json({ message: "No token provided, access denied" });
  }
}

// 🔹 Admin only
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }
  });
}

// 🔹 Super Admin only
function verifyTokenAndSuperAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role === "superadmin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied: Super Admin only" });
    }
  });
}

// 🔹 Admin or Super Admin
function verifyTokenAndAdminOrSuper(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied: Admin or Super Admin only" });
    }
  });
}

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndSuperAdmin,
  verifyTokenAndAdminOrSuper,
};
