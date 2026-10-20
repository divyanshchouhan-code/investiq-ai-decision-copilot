
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const marketDataRoutes = require("./routes/marketDataRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://investiq-ai-pi.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());


app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database unavailable:", error.message);

    return res.status(503).json({
      success: false,
      message: "Database temporarily unavailable. Please try again.",
    });
  }
});


app.get("/", (req, res) => {
  res.send("InvestIQ API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/market", marketDataRoutes);

module.exports = app;
