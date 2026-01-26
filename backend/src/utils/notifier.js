const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  NOTIFY_EMAIL
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

console.log("SMTP CONFIG:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER ? "SET" : "MISSING",
  pass: process.env.SMTP_PASS ? "SET" : "MISSING"
});

transporter.verify()
  .then(() => {
    console.log("✅ SMTP connected successfully");
  })
  .catch(err => {
    console.error("❌ SMTP connection failed:", err.message);
    process.exit(1); // stop server if email is mandatory
  });

function sendOrderStatusNotification(order) {
  if (!order) return;

  const { order_code, status } = order;
  const targetEmail = NOTIFY_EMAIL || SMTP_USER;
  if (!targetEmail) return;

  const friendlyStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Updated";

  transporter.sendMail({
    from: `"Order Tracker" <${SMTP_USER}>`,
    to: targetEmail,
    subject: `Order ${order_code} status updated`,
    text: `Order ${order_code} status changed to: ${friendlyStatus}`,
    html: `
      <p><strong>Order Update</strong></p>
      <p>Order Code: <strong>${order_code}</strong></p>
      <p>New Status: <strong>${friendlyStatus}</strong></p>
    `
  })
  .then(() => console.log(`📧 Status email sent to ${targetEmail}`))
  .catch(err => console.error("📧 Email send failed:", err.message));
}

module.exports = { sendOrderStatusNotification };
