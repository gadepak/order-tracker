const db = require('../db');

// ==========================
// CREATE ORDER
// ==========================
async function createOrder(req, res) {
  try {
    console.log("REQ BODY:", req.body);

    const {
      tray_type,
      serial_no,
      make,
      dimensions,
      nos,
      size,
      status,
      payment_status,
      credit_days
    } = req.body;

    // INSERT NEW STRUCTURE FIELDS
    const [result] = await db.query(
      `INSERT INTO orders (
        tray_type,
        serial_no,
        make,
        dimensions,
        nos,
        size,
        status,
        payment_status,
        credit_days
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tray_type,
        serial_no,
        make,
        dimensions,
        nos,
        size,
        status || "CUTTING",
        payment_status || "PAID",
        payment_status === "NOT_PAID" ? credit_days : null
      ]
    );

    const newId = result.insertId;

    // Generate Order Code
    const order_code = `ORD-${String(newId).padStart(4, "0")}`;

    await db.query(`UPDATE orders SET order_code = ? WHERE id = ?`, [
      order_code,
      newId,
    ]);

    res.json({
      success: true,
      message: "Order created",
      order_code,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create failed" });
  }
}

// ==========================
// GET ORDER BY ORDER CODE
// ==========================
async function getOrderByCode(req, res) {
  try {
    const { code } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM orders WHERE order_code = ? AND is_deleted = 0`,
      [code]
    );

    if (!rows.length)
      return res.status(404).json({ error: "not found" });

    res.json({ order: rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "tracking failed" });
  }
}

// ==========================
// LIST PENDING (NOT COMPLETED)
// ==========================
async function listPending(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders
       WHERE is_deleted = 0 AND status != 'COMPLETED'
       ORDER BY updated_at DESC`
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "pending list failed" });
  }
}

// ==========================
// LIST COMPLETED
// ==========================
async function listCompleted(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders
       WHERE is_deleted = 0 AND status = 'COMPLETED'
       ORDER BY updated_at DESC`
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "completed list failed" });
  }
}

// ==========================
// LIST DELETED
// ==========================
async function listDeleted(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders
       WHERE is_deleted = 1
       ORDER BY updated_at DESC`
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "deleted list failed" });
  }
}

// ==========================
// GET ORDER BY ID
// ==========================
async function getOrder(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM orders WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ error: "not found" });

    res.json({ order: rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "get failed" });
  }
}

// ==========================
// UPDATE PAYMENT STATUS
// ==========================
async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    await db.query(
      `UPDATE orders 
       SET payment_status = ?,
           credit_days = IF(? = 'PAID', NULL, credit_days),
           updated_at = NOW()
       WHERE id = ?`,
      [payment_status, payment_status, id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment update failed" });
  }
}

// ==========================
// UPDATE ORDER STATUS
// ==========================
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    const [rows] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);

    res.json({ order: rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update failed" });
  }
}

// ==========================
// SOFT DELETE ORDER
// ==========================
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE orders SET is_deleted = 1, updated_at = NOW() WHERE id = ?`,
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "delete failed" });
  }
}

async function listPendingPayment(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders
       WHERE is_deleted = 0 
         AND payment_status = 'NOT_PAID'
       ORDER BY updated_at DESC`
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "pending payment failed" });
  }
}


module.exports = {
  createOrder,
  listPending,
  listCompleted,
  listDeleted,
  listPendingPayment,
  getOrder,
  updateStatus,
  deleteOrder,
  getOrderByCode,
  updatePayment
};
