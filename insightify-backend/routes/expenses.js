// routes/expenses.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
async function verifyToken(req, res, next) {
  try {
    const auth = req.headers["authorization"];
    if (!auth) return res.status(401).json({ error: "Missing Authorization header" });

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ error: "Malformed token" });

    const token = parts[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

// Get all expenses for the authenticated user
router.get("/", verifyToken, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { incurredAt: "desc" },
    });
    res.json(expenses);
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new expense
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, amount, category, incurredAt } = req.body;
    
    if (!title || amount === undefined) {
      return res.status(400).json({ error: "Title and amount are required" });
    }

    const expense = await prisma.expense.create({
      data: {
        userId: req.userId,
        title,
        amount: Number(amount),
        category: category || null,
        incurredAt: incurredAt ? new Date(incurredAt) : new Date(),
      },
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

