// app.js (replace your current app.js with this)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ordersRoutes = require('./routes/orders');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const reminderRoutes = require('./routes/orderReminders'); // require is fine here

const app = express(); // <<< MUST be created BEFORE app.use(...)
app.use(cors());
app.use(express.json());

// simple request logging
app.use((req, res, next) => {
  console.log('>>> HIT BACKEND <<<', new Date().toISOString(), req.method, req.url);
  console.log('INCOMING:', req.method, req.url);
  next();
});

// === START: ENV SANITIZERS + DEBUG ENDPOINTS ===
const net = require('net');

// remove zero-width / bidi / invisible characters
function stripHidden(s){
  if(!s) return '';
  return String(s).replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '').trim();
}

// normalize whatsapp numbers to 'whatsapp:+<digits>' if possible
function ensureWhatsAppPrefix(num){
  if(!num) return '';
  num = stripHidden(num);
  if(/^whatsapp:/i.test(num)) {
    return 'whatsapp:' + num.replace(/^whatsapp:/i,'').trim();
  }
  const digits = num.replace(/[^+\d]/g,'');

  if(/^\+?\d+$/.test(digits)) return 'whatsapp:' + digits;
  return num;
}

// sanitize SMTP host (remove http:// if accidentally present)
const rawSmtpHost = process.env.SMTP_HOST || '';
const smtpHost = rawSmtpHost.replace(/^https?:\/\//i,'').trim();
const smtpPort = Number(process.env.SMTP_PORT || 465);

// sanitized examples to use in your main code (do not log secrets)
// NOTE: use the ACCOUNT_SID/AUTH_TOKEN names used elsewhere in your app
const sanitizedEnvs = {
  smtpHost, smtpPort,
  smtpUserPresent: !!process.env.SMTP_USER,
  smtpPassPresent: !!process.env.SMTP_PASS,
  // check the correct Twilio env names
  twilioSidPresent: !!process.env.TWILIO_ACCOUNT_SID,
  twilioAuthPresent: !!process.env.TWILIO_AUTH_TOKEN,
  waFromRaw: (process.env.TWILIO_WHATSAPP_FROM || '').slice(0,80),
  waFromSanitized: ensureWhatsAppPrefix(process.env.TWILIO_WHATSAPP_FROM || '')
};

// Debug endpoint: show what the process sees (no secret values)
app.get('/debug/envs', (req, res) => {
  return res.json({
    smtpHostRaw: rawSmtpHost.slice(0,120),
    smtpHostSanitized: smtpHost,
    smtpPort,
    smtpUserPresent: !!process.env.SMTP_USER,
    waFromRaw: (process.env.TWILIO_WHATSAPP_FROM || '').slice(0,80),
    waFromSanitized: sanitizedEnvs.waFromSanitized
  });
});

// Debug WA check: normalize a 'to' number (body: { to: "+91..." })
app.post('/debug/wa-check', express.json(), (req, res) => {
  const toRaw = req.body && req.body.to ? String(req.body.to) : '';
  const waFrom = ensureWhatsAppPrefix(process.env.TWILIO_WHATSAPP_FROM || '');
  const waTo = ensureWhatsAppPrefix(toRaw || process.env.TEST_WA_TO || '');
  const waFromValid = !!/^whatsapp:\+\d{6,15}$/.test(waFrom);
  const waToValid = !!/^whatsapp:\+\d{6,15}$/.test(waTo);
  return res.json({ waFrom, waTo, waFromValid, waToValid });
});

// Debug TCP check: tests Railway container -> SMTP host:port connectivity
app.get('/debug/tcp-check', (req, res) => {
  const host = (req.query.host || smtpHost || 'smtp.gmail.com').replace(/^https?:\/\//i,'').trim();
  const port = Number(req.query.port || smtpPort || 465);
  const timeout = Number(req.query.timeout || 7000);
  const socket = new net.Socket();
  let done = false;
  socket.setTimeout(timeout);
  socket.on('connect', () => { if(done) return; done=true; socket.destroy(); res.json({ ok: true, host, port, msg: 'tcp connect success' }); });
  socket.on('timeout', () => { if(done) return; done=true; socket.destroy(); res.status(504).json({ ok: false, error: 'timeout' }); });
  socket.on('error', (err) => { if(done) return; done=true; socket.destroy(); res.status(502).json({ ok: false, error: err.message, code: err.code }); });
  socket.connect(port, host);
});

/* Optional test endpoints (uncomment if you want to use them)
app.post('/debug/send-wa', express.json(), async (req, res) => { ... });
app.get('/debug/send-email', async (req, res) => { ... });
*/
// === END: ENV SANITIZERS + DEBUG ENDPOINTS ===

// Routes (after sanitizers)
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', reminderRoutes); // mount reminders here alongside other api routes

// PORT must be defined
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
