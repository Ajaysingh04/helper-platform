const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "helper_super_secret_production_key_2026";

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ success: false, message: "User not found or deleted" });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: "Account has been suspended by Admin" });
      }

      next();
    } catch (error) {
      console.error("JWT Auth Verification Error:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
    }
  } else {
    return res.status(401).json({ success: false, message: "Not authorized, no bearer token provided" });
  }
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "30d"
  });
};

module.exports = { protect, generateToken };
