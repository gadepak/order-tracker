const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ordersRoutes = require('./routes/orders');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const reminderRoutes = require('./routes/orderReminders');
const { checkMaintenance } = require("./middleware/checkMaintenance");
const app = express();
const db = require('./db'); // or correct path to your mysql pool file
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://order-tracker-puce.vercel.app',
    'https://order-tracker-murex-mu.vercel.app',
    'https://order-tracker-xi.vercel.app',
    'https://order-tracker-tau.vercel.app'
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use("/api", checkMaintenance);
app.use((req, res, next) => {
  console.log('>>> HIT BACKEND <<<', req.method, req.url);
  next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', reminderRoutes);

// health check (IMPORTANT)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ db: 'connected', result: rows[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ db: 'error', error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});
