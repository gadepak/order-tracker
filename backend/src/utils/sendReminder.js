// src/utils/sendReminder.js
const twilio = require('twilio');
const nodemailer = require('nodemailer');

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

async function sendEmail(toEmail, subject, text, html) {
  if (!transporter) {
    console.warn('SMTP transporter not configured; skipping email');
    return { ok: false, error: 'smtp_not_configured' };
  }
  if (!process.env.SMTP_FROM) {
    console.warn('SMTP_FROM not set; skipping email');
    return { ok: false, error: 'smtp_from_missing' };
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: toEmail,
      subject,
      text,
      html
    });
    return { ok: true, info };
  } catch (err) {
    console.error('Email send failed:', err);
    return { ok: false, error: err.message || err };
  }
}

async function sendWhatsApp(toPhone, body) {
  if (!twilioClient) {
    console.warn('Twilio not configured; skipping WhatsApp send');
    return { ok: false, error: 'twilio_not_configured' };
  }
  if (!process.env.TWILIO_WHATSAPP_FROM) {
    console.warn('TWILIO_WHATSAPP_FROM not set; skipping WhatsApp send');
    return { ok: false, error: 'twilio_from_missing' };
  }
  try {
    const to = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;
    const from = process.env.TWILIO_WHATSAPP_FROM.startsWith('whatsapp:')
      ? process.env.TWILIO_WHATSAPP_FROM
      : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

    const msg = await twilioClient.messages.create({
      from,
      to,
      body
    });
    return { ok: true, sid: msg.sid };
  } catch (err) {
    console.error('WhatsApp send failed:', err);
    return { ok: false, error: err.message || err };
  }
}

/**
 * sendReminder(order)
 * order: object from your DB row (should contain id, order_code, email, phone, credit_days, created_at)
 * returns { email: {...}, whatsapp: {...} }
 */
async function sendReminder(order) {
  const results = { email: null, whatsapp: null };

  if (!order) throw new Error('order required');

  const created = new Date(order.created_at);
  const days = Number(order.credit_days || 0);
  const dueDate = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);

  const subject = `Payment reminder - Order ${order.order_code || `#${order.id}`}`;
  const text = `Hello,

This is a friendly payment reminder for Order ${order.order_code || `#${order.id}`} placed on ${created.toLocaleDateString()}. The credit period of ${days} day(s) ended on ${dueDate.toLocaleDateString()}.

Please make the payment at your earliest convenience. If you have already paid, please ignore this message or reply with the payment details.

Thank you,
Your Company`;
  const html = `<p>Hello,</p>
<p>This is a friendly payment reminder for <strong>Order ${order.order_code || `#${order.id}`}</strong> placed on <strong>${created.toLocaleDateString()}</strong>. The credit period of <strong>${days} day(s)</strong> ended on <strong>${dueDate.toLocaleDateString()}</strong>.</p>
<p>Please make the payment at your earliest convenience. If you have already paid, please ignore this message or reply with the payment details.</p>
<p>Thank you,<br/>Your Company</p>`;

  // Email
  if (order.email) {
    results.email = await sendEmail(order.email, subject, text, html);
  } else {
    results.email = { ok: false, error: 'no_email' };
  }

  // WhatsApp
  if (order.phone) {
    const waBody = `Payment reminder for Order ${order.order_code || `#${order.id}`}.
Order date: ${created.toLocaleDateString()}
Credit days: ${days}
Due date: ${dueDate.toLocaleDateString()}

Please make the payment or contact us to discuss.`;
    results.whatsapp = await sendWhatsApp(order.phone, waBody);
  } else {
    results.whatsapp = { ok: false, error: 'no_phone' };
  }

  return results;
}

module.exports = {
  sendReminder,
  // export helpers in case you want to reuse them
  sendEmail,
  sendWhatsApp
};
