const db = require('../db');
const { sendOrderStatusNotification } = require('../utils/notifier');

const { sendWhatsApp } = require('../utils/whatsapp');

// CREATE
async function createOrder(req, res) {
  try {
     console.log("REQ BODY:", req.body);
    // throw new Error("INTENTIONAL ERROR FROM createOrder");
    const {
      product_name,
      customer_name,
      quantity,
      product_description,
      customer_email,   
      customer_phone,   
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO orders (
        product_name,
        customer_name,
        quantity,
        product_description,
        customer_email,
        customer_phone
      )
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        customer_name,
        quantity,
        product_description,
        customer_email || null,
        customer_phone || null,
      ]
    );

    const newId = result.insertId;
    //const prefix = customer_name.substring(0, 3).toUpperCase();
    const order_code = `ORD-${String(newId).padStart(4, '0')}`;
//jhkjb

    await db.query(`UPDATE orders SET order_code = ? WHERE id = ?`, [
      order_code,
      newId,
    ]);

    res.json({ success: true, message: "Order created", order_code });
    if (customer_phone) {
  const waMessage =
    `Hi ${customer_name}! 👋\n\n` +
    `Your order *${order_code}* has been *registered*.\n\n` +
    `Product: ${product_name}\n` +
    `Quantity: ${quantity}\n\n` +
    `We'll notify you as it moves to processing, completing, and completed.`;

  sendWhatsApp(customer_phone, waMessage);
}

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create failed" });
  }
}

async function getOrderByCode(req, res) {
  try {
    const { code } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM orders WHERE order_code = ? AND is_deleted = 0`,
      [code]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "not found" });
    }

    res.json({ order: rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "tracking failed" });
  }
}

// PENDING ORDERS  (is_deleted = 0 AND status != completed)
async function listPending(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders
       WHERE is_deleted = 0 AND status != 'completed'
       ORDER BY updated_at DESC`
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "pending list failed" });
  }
}

// COMPLETED ORDERS  (is_deleted = 0 AND status = completed)
async function listCompleted(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders
       WHERE is_deleted = 0 AND status = 'completed'
       ORDER BY updated_at DESC`
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "completed list failed" });
  }
}

// DELETED ORDERS (is_deleted = 1)
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

// GET SINGLE ORDER
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

// UPDATE STATUS
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    const [rows] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    const updatedOrder = rows[0];

    // send email / notification (if email exists)
    sendOrderStatusNotification(updatedOrder).catch(err =>
      console.error("Notification error (email):", err)
    );

    // 📲 send WhatsApp notification (if phone exists)
    if (updatedOrder.customer_phone) {
      const waMessage =
        `Hi ${updatedOrder.customer_name},\n\n` +
        `Your order *${updatedOrder.order_code || `#${updatedOrder.id}`}* ` +
        `for "${updatedOrder.product_name}" is now *${status}*.\n\n` +
        `Thank you!`;

      // fire-and-forget so it doesn't block response
      sendWhatsApp(updatedOrder.customer_phone, waMessage)
        .catch(err => console.error("Notification error (WhatsApp):", err));
    }

    res.json({ order: updatedOrder });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update failed" });
  }
}

// DELETE (SET is_deleted = 1)
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

module.exports = {
  createOrder,
  listPending,
  listCompleted,
  listDeleted,
  getOrder,
  updateStatus,
  deleteOrder,
  getOrderByCode,
};
