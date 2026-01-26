const db = require('../db');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const { sendOrderStatusNotification } = require("../utils/notifier");
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false, // upgrade later with STARTTLS
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

// helper: send WhatsApp (if configured)
async function sendWhatsApp(toPhone, body) {
  if (!twilioClient) {
    console.warn("Twilio not configured; skipping WhatsApp send");
    return;
  }
  if (!process.env.TWILIO_WHATSAPP_FROM) {
    console.warn("TWILIO_WHATSAPP_FROM not set; skipping WhatsApp send");
    return;
  }
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM, // e.g. 'whatsapp:+1415XXXXXXX'
      to: toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`,
      body
    });
  } catch (err) {
    console.error("WhatsApp send failed:", err);
  }
}

// helper: send email (if configured)
async function sendEmail(toEmail, subject, text) {
  if (!transporter) {
    console.warn("SMTP transporter not configured; skipping email");
    return;
  }
  if (!process.env.SMTP_FROM) {
    console.warn("SMTP_FROM not set; skipping email");
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: toEmail,
      subject,
      text
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

// ==========================
// CREATE ORDER
// ==========================
// ==========================
// CREATE ORDER
// ==========================
// CREATE ORDER
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
      credit_days,
      email,
      phone
    } = req.body;

    // Generate order_code BEFORE insert
    const order_code = `ORD-${Date.now()}`;

    // INSERT including email & phone & order_code
    const [result] = await db.query(
      `INSERT INTO orders (
        order_code,
        tray_type,
        serial_no,
        make,
        dimensions,
        nos,
        size,
        status,
        payment_status,
        credit_days,
        email,
        phone
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_code,
        tray_type,
        serial_no,
        make,
        dimensions,
        nos,
        size,
        status || "CUTTING",
        payment_status || "PAID",
        payment_status === "NOT_PAID" ? credit_days : null,
        email || null,
        phone || null
      ]
    );

    const newId = result.insertId;

    res.json({
      success: true,
      message: "Order created",
      id: newId,
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
// UPDATE ORDER STATUS (with notifications)
async function updateStatus(req, res) {
  try {
    const { id } = req.params;

    // 🔒 Normalize & validate status
    const rawStatus = req.body.status;
    const status = String(rawStatus || '').trim().toUpperCase();

    const allowedStatuses = [
      'CUTTING',
      'PERFORATED',
      'BENDING',
      'COMPLETED'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status value: ${rawStatus}`
      });
    }

    // ✅ Update status in DB
    await db.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    // Fetch updated order
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = rows[0];

    // Compose notification text
    const shortMsg =
      `Order ${order.order_code || `#${order.id}`} status updated to ${status}.`;

    const longMsg =
      `Hello,\n\nYour order ${order.order_code || `#${order.id}`} ` +
      `status has changed to ${status}.\n\n` +
      `You can track your order using the order code.\n\nRegards,\nYour Company`;

    // 🔔 Send WhatsApp (NON-BLOCKING)
    if (order.phone) {
      sendWhatsApp(order.phone, shortMsg)
        .catch(err => console.error("WhatsApp failed:", err.message));
    }

    // 📧 Send Email (NON-BLOCKING)
    if (order.email) {
      sendOrderStatusNotification(order);

    }

    // ✅ Always return success
    res.json({ success: true, order });

  } catch (err) {
    console.error("updateStatus error:", err);
    res.status(500).json({ error: "update failed" });
  }
}

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
