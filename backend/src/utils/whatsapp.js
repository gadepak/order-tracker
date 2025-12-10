// src/utils/whatsapp.js
const twilio = require("twilio");

// Validate environment variables
const SID = process.env.TWILIO_ACCOUNT_SID || "";
const AUTH = process.env.TWILIO_AUTH_TOKEN || "";
const FROM_RAW = process.env.TWILIO_WHATSAPP_FROM || "";

// Normalize number: ensure format "whatsapp:+<digits>"
function normalizeNumber(num) {
  if (!num) return "";
  num = String(num).trim();

  // already correct
  if (/^whatsapp:\+\d{6,15}$/.test(num)) return num;

  // remove existing prefix & clean digits
  num = num.replace(/^whatsapp:/i, "").trim();
  const digits = num.replace(/[^+\d]/g, "");

  if (!/^\+?\d{6,15}$/.test(digits)) return ""; // invalid number

  return `whatsapp:${digits}`;
}

// Normalize sender number too
const FROM = normalizeNumber(FROM_RAW);

// Create client only if SID/AUTH exist
const client = (SID && AUTH) ? twilio(SID, AUTH) : null;

/**
 * Send WhatsApp message using Twilio
 */
async function sendWhatsApp(toNumber, message) {
  if (!client) {
    console.warn("WhatsApp: Twilio client not configured, skipping send.");
    return;
  }

  if (!FROM) {
    console.warn("WhatsApp: Invalid TWILIO_WHATSAPP_FROM number, skipping.");
    return;
  }

  const to = normalizeNumber(toNumber);

  if (!to) {
    console.warn("WhatsApp: Invalid destination number, skipping.");
    return;
  }

  try {
    const msg = await client.messages.create({
      from: FROM,
      to,
      body: message,
    });

    console.log("WhatsApp message sent, SID:", msg.sid);
  } catch (err) {
    console.error("Failed to send WhatsApp message:", err.message);
  }
}

module.exports = { sendWhatsApp };
