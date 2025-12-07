// routes/analytics.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware (TODO: Extract to common file)
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

router.get("/summary", verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [expenses, incomes] = await Promise.all([
            prisma.expense.findMany({ where: { userId: req.userId } }),
            prisma.income.findMany({ where: { userId: req.userId } }),
        ]);

        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

        const monthlyExpense = expenses
            .filter(e => e.incurredAt >= startOfMonth && e.incurredAt <= endOfMonth)
            .reduce((sum, e) => sum + e.amount, 0);

        const monthlyIncome = incomes
            .filter(i => i.receivedAt >= startOfMonth && i.receivedAt <= endOfMonth)
            .reduce((sum, i) => sum + i.amount, 0);

        // Group by Category (Expenses)
        const categoryMap = {};
        expenses.forEach(e => {
            const cat = e.category || "Uncategorized";
            categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
        });

        // Group by Month (Last 6 months) for charts
        const monthlyDataMap = {};
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // "2023-10"
            monthlyDataMap[key] = { name: d.toLocaleString('default', { month: 'short' }), income: 0, expense: 0 };
        }

        expenses.forEach(e => {
            const d = new Date(e.incurredAt);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (monthlyDataMap[key]) monthlyDataMap[key].expense += e.amount;
        });

        incomes.forEach(i => {
            const d = new Date(i.receivedAt);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (monthlyDataMap[key]) monthlyDataMap[key].income += i.amount;
        });

        const monthlyChartData = Object.values(monthlyDataMap).reverse();
        const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

        res.json({
            summary: {
                totalExpense,
                totalIncome,
                monthlyExpense,
                monthlyIncome,
                balance: totalIncome - totalExpense
            },
            charts: {
                monthly: monthlyChartData,
                categories: categoryChartData
            }
        });

    } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
