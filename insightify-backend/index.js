require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const expensesRouter = require("./routes/expenses");

const app = express();
app.use(express.json());

// Normalize FRONTEND_URL to include protocol
let frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
if (frontendUrl && !frontendUrl.startsWith("http://") && !frontendUrl.startsWith("https://")) {
  // Auto-add https:// if protocol is missing (for production)
  frontendUrl = `https://${frontendUrl}`;
  console.log(`[CORS] Auto-added protocol to FRONTEND_URL: ${frontendUrl}`);
}

console.log(`[CORS] Allowing origin: ${frontendUrl}`);

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/expenses", expensesRouter);
app.use("/incomes", require("./routes/incomes"));
app.use("/analytics", require("./routes/analytics"));
app.get("/", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
