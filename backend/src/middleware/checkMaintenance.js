const db = require("../db");

// APIs that should work even after expiry
const ALLOWED_PATHS = [
  "/api/auth",
  "/health"
];

async function checkMaintenance(req, res, next) {
  try {
    // Allow some routes always
    if (ALLOWED_PATHS.some(path => req.path.startsWith(path))) {
      return next();
    }

    const [rows] = await db.query(
      "SELECT maintenance_expires_at FROM app_config WHERE id = 1"
    );

    if (!rows.length) {
      return res.status(500).json({
        error: "Maintenance configuration missing"
      });
    }

    const expiry = new Date(rows[0].maintenance_expires_at);
    const now = new Date();

    if (now > expiry) {
      return res.status(403).json({
        code: "MAINTENANCE_EXPIRED",
        message:
          "Service expired. Please pay maintenance to continue your service."
      });
    }

    next();
  } catch (err) {
    console.error("Maintenance check failed:", err.message);
    next(); // fail-open on DB issues
  }
}

module.exports = { checkMaintenance };
