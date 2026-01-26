const SibApiV3Sdk = require("sib-api-v3-sdk");

// Configure Brevo API
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

function sendOrderStatusNotification(order) {
  if (!order || !order.email) return;

  const sendEmail = {
    to: [{ email: order.email }],
    sender: {
      email: "no-reply@yourdomain.com", // MUST be verified in Brevo
      name: "Order Tracker"
    },
    subject: `Order ${order.order_code || order.id} status updated`,
    htmlContent: `
      <p><strong>Order Status Updated</strong></p>
      <p>Order Code: <strong>${order.order_code || order.id}</strong></p>
      <p>New Status: <strong>${order.status}</strong></p>
      <br/>
      <p>Thank you.</p>
    `
  };

  emailApi.sendTransacEmail(sendEmail)
    .then(() => {
      console.log("📧 Status email sent via Brevo API");
    })
    .catch(err => {
      console.error("📧 Brevo email failed:", err.message);
    });
}

module.exports = { sendOrderStatusNotification };
