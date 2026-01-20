const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ordersRoutes = require('./routes/orders');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const reminderRoutes = require('./routes/orderReminders');

const app = express();

app.use(cors());
app.use(express.json());

// logging (safe on Vercel)
app.use((req, res, next) => {
  console.log('>>> HIT BACKEND <<<', new Date().toISOString(), req.method, req.url);
  next();
});

/* ================= YOUR DEBUG CODE ================= */
/* KEEP EVERYTHING YOU ALREADY HAVE HERE              */
/* env sanitizers, tcp-check, wa-check, etc            */
/* =================================================== */

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', reminderRoutes);

/**
 * 🚨 IMPORTANT FOR VERCEL
 * ❌ DO NOT listen()
 * ✅ EXPORT the app
 */
module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on ${PORT}`);
  });
}
