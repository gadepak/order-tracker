const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ordersRoutes = require('./routes/orders');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
//bhjbb
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(">>> HIT BACKEND <<<", new Date().toISOString(), req.method, req.url);
  next();
});

app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/search', searchRoutes);

//const PORT = process.env.PORT || 4000;
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
