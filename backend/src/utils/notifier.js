const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  NOTIFY_EMAIL // optional admin notification email
} = process.env;

// EMAIL TRANSPORT
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Send notification when order status changes
 * NEW STRUCTURE -> customer fields do NOT exist
 * So we notify only admin or skip silently.
 */
async function sendOrderStatusNotification(order) {
  if (!order) return;

  const {
    order_code,
    status
  } = order;

  // If you want admin notifications:
  const targetEmail = NOTIFY_EMAIL || SMTP_USER;

  if (!targetEmail) {
    console.log("No notification email configured. Skipping email.");
    return;
  }

  const friendlyStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Updated";

  const subject = `Order ${order_code} status updated`;
  const text = `Order ${order_code} status changed to: ${friendlyStatus}`;

  try {
    await transporter.sendMail({
      from: `"Order Tracker" <${SMTP_USER}>`,
      to: targetEmail,
      subject,
      text,
      html: `
        <p><strong>Order Update</strong></p>
        <p>Order Code: <strong>${order_code}</strong></p>
        <p>New Status: <strong>${friendlyStatus}</strong></p>
      `,
    });

    console.log(`Status email sent to admin: ${targetEmail}`);
  } catch (err) {
    console.error("Failed to send status email:", err.message);
  }
}

module.exports = { sendOrderStatusNotification };
