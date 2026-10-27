const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
  // Get token from Authorization header or custom headers
  const authHeader = req.header("Authorization") || req.header("auth-token") || req.header("x-auth-token");
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader;

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || "imovies_super_secret_jwt_key_2026_secure!");
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

const requireAdmin = (req, res, next) => {
  fetchUser(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
  });
};

module.exports = { fetchUser, requireAdmin };
