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

app.use((req, res, next) => {
  console.log('>>> HIT BACKEND <<<', req.method, req.url);
  next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', reminderRoutes);

// 🚨 RAILWAY REQUIRES THIS — NO FALLBACK
const PORT = process.env.PORT;

if (!PORT) {
  console.error('PORT is not defined');
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on ${PORT}`);
});
