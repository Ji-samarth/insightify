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
    console.log("[Auth] Header:", auth); // LOGGING ADDED

    if (!auth) {
      console.log("[Auth] Missing header");
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("[Auth] Malformed token");
      return res.status(401).json({ error: "Malformed token" });
    }

    const token = parts[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log("[Auth] Verify failed:", err.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = payload.id;
    next();
  } catch (err) {
    console.error("[Auth] Unexpected error:", err);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

// Get all expenses for the authenticated user
// Get all expenses with filtering, sorting, and pagination
router.get("/", verifyToken, async (req, res) => {
  try {
    const { category, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, page, limit } = req.query;

    const where = { userId: req.userId };

    if (category) where.category = category;

    if (startDate || endDate) {
      where.incurredAt = {};
      if (startDate) where.incurredAt.gte = new Date(startDate);
      if (endDate) where.incurredAt.lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = Number(minAmount);
      if (maxAmount) where.amount.lte = Number(maxAmount);
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.incurredAt = "desc";
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({
      data: expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update an expense
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, incurredAt } = req.body;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== req.userId) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        title,
        amount: amount !== undefined ? Number(amount) : undefined,
        category,
        incurredAt: incurredAt ? new Date(incurredAt) : undefined,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Update expense error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete an expense
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== req.userId) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await prisma.expense.delete({ where: { id } });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Delete expense error:", err);
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

