// routes/incomes.js
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

// Get all incomes with filtering, sorting, and pagination
router.get("/", verifyToken, async (req, res) => {
    try {
        const { category, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, page, limit } = req.query;

        const where = { userId: req.userId };

        if (category) where.category = category;

        if (startDate || endDate) {
            where.receivedAt = {};
            if (startDate) where.receivedAt.gte = new Date(startDate);
            if (endDate) where.receivedAt.lte = new Date(endDate);
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
            orderBy.receivedAt = "desc";
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const [incomes, total] = await Promise.all([
            prisma.income.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
            }),
            prisma.income.count({ where }),
        ]);

        res.json({
            data: incomes,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("Get incomes error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Create a new income
router.post("/", verifyToken, async (req, res) => {
    try {
        const { title, amount, category, receivedAt } = req.body;

        if (!title || amount === undefined) {
            return res.status(400).json({ error: "Title and amount are required" });
        }

        const income = await prisma.income.create({
            data: {
                userId: req.userId,
                title,
                amount: Number(amount),
                category: category || null,
                receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
            },
        });

        res.status(201).json(income);
    } catch (err) {
        console.error("Create income error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update an income
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, category, receivedAt } = req.body;

        const income = await prisma.income.findUnique({ where: { id } });
        if (!income || income.userId !== req.userId) {
            return res.status(404).json({ error: "Income not found" });
        }

        const updated = await prisma.income.update({
            where: { id },
            data: {
                title,
                amount: amount !== undefined ? Number(amount) : undefined,
                category,
                receivedAt: receivedAt ? new Date(receivedAt) : undefined,
            },
        });

        res.json(updated);
    } catch (err) {
        console.error("Update income error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete an income
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const income = await prisma.income.findUnique({ where: { id } });
        if (!income || income.userId !== req.userId) {
            return res.status(404).json({ error: "Income not found" });
        }

        await prisma.income.delete({ where: { id } });
        res.json({ message: "Income deleted" });
    } catch (err) {
        console.error("Delete income error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
