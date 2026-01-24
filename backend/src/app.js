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
  console.log('>>> HIT BACKEND <<<', new Date().toISOString(), req.method, req.url);
  next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', reminderRoutes);

// 🔴 THIS PART IS NON-NEGOTIABLE ON RAILWAY
const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT is not defined");
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on ${PORT}`);
});
