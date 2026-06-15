const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided ❌" });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    /* Normalise userId so getClinicId always works for doctors */
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id || decoded._id || null,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token ❌" });
  }
};