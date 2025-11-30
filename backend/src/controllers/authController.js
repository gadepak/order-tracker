const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length)
      return res.status(400).json({ error: 'User already exists' });

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "admin")',
      [name, email, password_hash]
    );

    res.json({ message: 'Admin user created' });

  } catch (err) {
    console.error('registerAdmin error', err);
    res.status(500).json({ error: 'register failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'login failed' });
  }
}
//hjvj
module.exports = { registerAdmin, login };
