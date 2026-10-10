const express = require("express");

const router = express.Router();

const {
    createInvestment,
    getInvestments,
    getInvestmentById,
    updateInvestmentController,
    deleteInvestmentController,
    getPortfolioSummaryController,
    getPortfolioAnalyticsController,
    getPortfolioRiskController,
    getInvestmentInsightsController,
    getInvestmentSpace,
    getActionEvidenceController,
    getMarketDataStatusController,
} = require("../controllers/portfolioController");

const {
    getHistoricalMetricsController
} = require("../controllers/portfolioController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createInvestment);

router.get("/", protect, getInvestments);

router.get("/summary", protect, getPortfolioSummaryController);

router.get("/analytics", protect, getPortfolioAnalyticsController);

router.get("/risk", protect, getPortfolioRiskController);

router.get("/insights", protect, getInvestmentInsightsController);

router.get("/investment-space", protect, getInvestmentSpace);

router.get(
    "/historical-metrics",
    protect,
    getHistoricalMetricsController
);

router.get(
    "/action-evidence",
    protect,
    (req, res, next) => {
        console.log("ACTION EVIDENCE ROUTE MATCHED");
        next();
    },
    getActionEvidenceController
);

router.get(
    "/market-data-status",
    protect,
    getMarketDataStatusController
);

router.get("/:id", protect, getInvestmentById);

router.put("/:id", protect, updateInvestmentController);

router.delete("/:id", protect, deleteInvestmentController);

module.exports = router;