const jwt = require('jsonwebtoken');

// Verify token and attach user info to req.user
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Invalid token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { _id, email, role }
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Check role middleware
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied for your role" });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRole };