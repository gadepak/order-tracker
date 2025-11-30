// src/utils/whatsapp.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send a WhatsApp message using Twilio
 * @param {string} toNumber - phone number with country code, e.g. +919293949107
 * @param {string} message - message body
 */
async function sendWhatsApp(toNumber, message) {
  if (!toNumber) {
    console.warn('WhatsApp: no destination number provided, skipping');
    return;
  }

  const to = toNumber.startsWith('whatsapp:')
    ? toNumber
    : `whatsapp:${toNumber}`;

  try {
    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM, // e.g. 'whatsapp:+14155238886'
      to,
      body: message,
    });

    console.log('WhatsApp message sent, SID:', msg.sid);
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err.message);
  }
}

module.exports = { sendWhatsApp };
//jkjkj