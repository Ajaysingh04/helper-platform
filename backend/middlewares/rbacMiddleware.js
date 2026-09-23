/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permissions for: 'customer', 'provider', 'admin', 'superadmin'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Normalize roles to lowercase for consistent comparison
    const userRole = (req.user.role || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole) && userRole !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(", ")}]. Current role: '${req.user.role}'`
      });
    }

    next();
  };
};

module.exports = { authorize };
