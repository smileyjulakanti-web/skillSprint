const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "skillsprint_secret_key";

module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    // If token is invalid or expired, continue as guest
  }

  next();
};
