// src/routes/orderReminders.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendReminder } = require('../utils/sendReminder');

// If you have auth middleware, enable it:
// const ensureAuth = require('../middleware/ensureAuth');

router.post('/orders/:id/remind', /* ensureAuth, */ async (req, res) => {
  const id = req.params.id;
  try {
    // load order
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'order not found' });

    const order = rows[0];

    // only for NOT_PAID
    if ((order.payment_status || '').toUpperCase() !== 'NOT_PAID') {
      return res.status(400).json({ error: 'order is not NOT_PAID' });
    }

    const days = Number(order.credit_days || 0);
    if (!days || days <= 0) {
      return res.status(400).json({ error: 'no credit days set' });
    }

    const created = new Date(order.created_at);
    const due = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
    if (new Date() <= due) {
      return res.status(400).json({ error: 'credit days not yet expired' });
    }

    // option: prevent spam by checking last_reminder_sent_at column
    // (only if you have such a column). Skip if you don't.
    // e.g. if (order.last_reminder_sent_at && new Date(order.last_reminder_sent_at) > (Date.now()-24*60*60*1000)) { ... }

    // send reminder
    const result = await sendReminder(order);

    // optional: if you have a column to track reminders, you can update it here.
    // Try safer update: if your DB has column 'last_reminder_sent_at' uncomment below:
    // await db.query('UPDATE orders SET last_reminder_sent_at = NOW() WHERE id = ?', [id]);

    return res.json({ success: true, result });
  } catch (err) {
    console.error('Remind error:', err);
    return res.status(500).json({ error: 'failed to send reminder' });
  }
});

module.exports = router;
