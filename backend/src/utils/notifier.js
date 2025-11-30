const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} = process.env;

//kjbkjb// EMAIL TRANSPORT
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
 * Expects: order_code, status, customer_name, customer_email
 */
async function sendOrderStatusNotification(order) {
  if (!order) return;

  const {
    order_code,
    status,
    customer_name,
    customer_email,
  } = order;

  if (!customer_email) {
    console.log("No email for this customer, skipping notification.");
    return;
  }

  const friendlyStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "updated";

  const text = `Hi ${customer_name || "Customer"}, your order ${
    order_code || ""
  } is now "${friendlyStatus}".`;

  const subject = `Order ${order_code} status updated to ${friendlyStatus}`;

  try {
    await transporter.sendMail({
      from: `"Order Tracker" <${SMTP_USER}>`,
      to: customer_email,
      subject,
      text,
      html: `
        <p>Hi ${customer_name || "Customer"},</p>
        <p>Your order <strong>${order_code}</strong> status has been updated to
        <strong>${friendlyStatus}</strong>.</p>
        <p>Thank you for shopping with us!</p>
      `,
    });

    console.log("Status email sent to", customer_email);
  } catch (err) {
    console.error("Failed to send status email:", err.message);
  }
}

module.exports = { sendOrderStatusNotification };
