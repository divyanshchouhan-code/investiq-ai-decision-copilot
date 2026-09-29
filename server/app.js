const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const marketDataRoutes = require("./routes/marketDataRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("InvestIQ API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/market", marketDataRoutes);

module.exports = app;