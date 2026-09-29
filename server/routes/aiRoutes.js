const express = require("express");

const {
    testAI,
    getPortfolioAIAnalysis,
    chatWithPortfolioAI
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", testAI);

router.get(
    "/portfolio-analysis",
    protect,
    getPortfolioAIAnalysis
);

router.post(
    "/chat",
    protect,
    chatWithPortfolioAI
); 


module.exports = router;