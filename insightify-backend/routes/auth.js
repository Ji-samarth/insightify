// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name: name || null, email, password: hashed }
    });

    const token = signToken({ id: user.id, email: user.email });
    const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email });
    const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// protected route
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Malformed token' });

    const token = parts[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
