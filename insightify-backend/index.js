// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use('/auth', authRouter);

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
