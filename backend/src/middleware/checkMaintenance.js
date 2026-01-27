import db from "../db.js";

export async function checkMaintenance(req, res, next) {
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
      message: "Service expired. Please pay maintenance to continue your service."
    });
  }

  next();
}
