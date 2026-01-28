const db = require("../db");

const ALLOWED_PATHS = [
  "/auth",
  "/maintenance/status"
];

async function checkMaintenance(req, res, next) {
  try {
    if (ALLOWED_PATHS.some(p => req.path.startsWith(p))) {
      return next();
    }

    const [rows] = await db.query(
      "SELECT maintenance_expires_at FROM app_config WHERE id = 1"
    );

    if (!rows.length) return next();

    const expired = new Date() > new Date(rows[0].maintenance_expires_at);

    if (expired) {
      return res.status(403).json({
        code: "MAINTENANCE_EXPIRED",   // 🔴 THIS WAS MISSING
        message:
          "Service expired. Please pay maintenance to continue your service."
      });
    }

    next();
  } catch (err) {
    console.error("Maintenance check error:", err.message);
    next();
  }
}

module.exports = { checkMaintenance };
