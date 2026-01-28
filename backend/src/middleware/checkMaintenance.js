const db = require("../db");

// paths RELATIVE to /api
const ALLOWED_PATHS = [
  "/auth",
  "/maintenance/status"
];

async function checkMaintenance(req, res, next) {
  try {
    // ✅ Allow auth & status check even if expired
    if (ALLOWED_PATHS.some(p => req.path.startsWith(p))) {
      return next();
    }

    const [rows] = await db.query(
      "SELECT maintenance_expires_at FROM app_config WHERE id = 1"
    );

    if (!rows.length) {
      return next();
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
    console.error("Maintenance check error:", err.message);
    next(); // fail-open
  }
}

module.exports = { checkMaintenance };
