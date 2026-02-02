const twilio = require("twilio");
const SibApiV3Sdk = require("sib-api-v3-sdk");

/* ---------------- BREVO SETUP ---------------- */
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* ---------------- TWILIO SETUP ---------------- */
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

/* ---------------- EMAIL (BREVO) ---------------- */
async function sendEmail(toEmail, subject, text, html) {
  if (!toEmail) {
    return { ok: false, error: "no_email" };
  }

  try {
    const sendEmail = {
      to: [{ email: toEmail }],
      sender: {
        email: process.env.BREVO_SENDER_EMAIL || "aravstake5@gmail.com", // must be verified
        name: "Order Tracker",
      },
      subject,
      htmlContent: html,
      textContent: text,
    };

    await emailApi.sendTransacEmail(sendEmail);
    return { ok: true };
  } catch (err) {
    console.error("📧 Brevo email failed:", err.message);
    return { ok: false, error: err.message || err };
  }
}

/* ---------------- WHATSAPP (TWILIO) ---------------- */
async function sendWhatsApp(toPhone, body) {
  if (!twilioClient) {
    console.warn("Twilio not configured; skipping WhatsApp send");
    return { ok: false, error: "twilio_not_configured" };
  }

  if (!process.env.TWILIO_WHATSAPP_FROM) {
    console.warn("TWILIO_WHATSAPP_FROM not set");
    return { ok: false, error: "twilio_from_missing" };
  }

  try {
    const to = toPhone.startsWith("whatsapp:")
      ? toPhone
      : `whatsapp:${toPhone}`;

    const from = process.env.TWILIO_WHATSAPP_FROM.startsWith("whatsapp:")
      ? process.env.TWILIO_WHATSAPP_FROM
      : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

    const msg = await twilioClient.messages.create({
      from,
      to,
      body,
    });

    return { ok: true, sid: msg.sid };
  } catch (err) {
    console.error("💬 WhatsApp send failed:", err.message);
    return { ok: false, error: err.message || err };
  }
}

/* ---------------- MAIN REMINDER ---------------- */
/**
 * sendReminder(order)
 * order must contain:
 * id, order_code, email, phone, credit_days, created_at
 */
async function sendReminder(order) {
  if (!order) throw new Error("order required");

  const results = { email: null, whatsapp: null };

  const created = new Date(order.created_at);
  const days = Number(order.credit_days || 0);
  const dueDate = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);

  const subject = `Payment reminder - Order ${order.order_code || `#${order.id}`}`;

  const text = `Hello,

This is a payment reminder for Order ${
    order.order_code || `#${order.id}`
  } placed on ${created.toLocaleDateString()}.

The credit period of ${days} day(s) ended on ${dueDate.toLocaleDateString()}.

Please make the payment at your earliest convenience.

Thank you,
Order Tracker`;

  const html = `
    <p>Hello,</p>
    <p>
      This is a payment reminder for
      <strong>Order ${order.order_code || `#${order.id}`}</strong>
      placed on <strong>${created.toLocaleDateString()}</strong>.
    </p>
    <p>
      The credit period of <strong>${days} day(s)</strong>
      ended on <strong>${dueDate.toLocaleDateString()}</strong>.
    </p>
    <p>Please make the payment at your earliest convenience.</p>
    <p>Thank you,<br/>Order Tracker</p>
  `;

  /* EMAIL */
  results.email = await sendEmail(order.email, subject, text, html);

  /* WHATSAPP */
  if (order.phone) {
    const waBody = `Payment reminder for Order ${
      order.order_code || `#${order.id}`
    }.

Order date: ${created.toLocaleDateString()}
Credit days: ${days}
Due date: ${dueDate.toLocaleDateString()}

Please make the payment or contact us.`;

    results.whatsapp = await sendWhatsApp(order.phone, waBody);
  } else {
    results.whatsapp = { ok: false, error: "no_phone" };
  }

  return results;
}

module.exports = {
  sendReminder,
  sendEmail,
  sendWhatsApp,
};
