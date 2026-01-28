const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/maintenance/status", async (req, res) => {
  const [rows] = await db.query(
    "SELECT maintenance_expires_at FROM app_config WHERE id = 1"
  );

  const expired = rows.length
    ? new Date() > new Date(rows[0].maintenance_expires_at)
    : false;

  res.json({ expired });
});

module.exports = router;
