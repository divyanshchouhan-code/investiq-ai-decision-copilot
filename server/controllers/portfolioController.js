const {
    addInvestment,
    fetchInvestments,
    fetchInvestmentById,
    updateInvestment,
    deleteInvestment,
    getPortfolioSummary,
    getPortfolioAnalytics,
} = require("../services/portfolioService");

const {
    getHistoricalMetrics
} = require("../services/historicalMetricsService");

const {
    getInvestmentsWithCurrentValue
} = require("../services/portfolioDataService");

const {
    evaluateActionRules
} = require("../services/actionRuleService");

const {
    getHistoricalPrices
} = require("../services/historicalDataService");

const {
    getActionEvidence
} = require("../services/actionEvidenceService");

const {
    getInvestmentSpaceData
} = require("../services/investmentSpaceService");

const {
    getPortfolioRiskForUser
} = require("../services/riskService");

const {
    getInvestmentInsightsForUser
} = require("../services/insightService");

const createInvestment = async (req, res) => {
    try{
        const investmentData  = req.body
        const userId = req.userId
        const result = await addInvestment(investmentData, userId)
        return res.status(201).json(result);
    }catch(error){
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
};

const getInvestments = async(req, res) => {
    try {
        const userId = req.userId
        const result = await fetchInvestments(userId);
        return res.status(200).json(result)

    }catch(error){
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

const getInvestmentById = async (req, res) => {
    try {
        const investmentId = req.params.id;
        const userId = req.userId;

        const result = await fetchInvestmentById(
            investmentId,
            userId
        );

        return res.status(200).json(result);

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const updateInvestmentController = async (req, res) => {
    try {
        const investmentId = req.params.id;
        const userId = req.userId;
        const updateData = req.body;

        const result = await updateInvestment(
            investmentId,
            userId,
            updateData
        );

        return res.status(200).json(result);

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteInvestmentController = async (req, res) => {
    try {
        const investmentId = req.params.id;
        const userId = req.userId;

        const result = await deleteInvestment(
            investmentId,
            userId
        );

        return res.status(200).json(result);

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


const getPortfolioSummaryController = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await getPortfolioSummary(userId);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


const getPortfolioAnalyticsController = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await getPortfolioAnalytics(userId);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getPortfolioRiskController = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await getPortfolioRiskForUser(userId);

        return res.status(200).json({
            success: true,
            risk: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getInvestmentInsightsController = async (req, res) => {

    try {

        const userId = req.userId;

        const result =
            await getInvestmentInsightsForUser(userId);

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

const getInvestmentSpace = async (req, res) => {
    try {
        const userId = req.userId;

        const data =
            await getInvestmentSpaceData(userId);

        return res.status(200).json({
            success: true,
            ...data,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getHistoricalMetricsController = async (req, res) => {
    try {
        const { symbol, debug } = req.query;

        if (!symbol || typeof symbol !== "string") {
            return res.status(400).json({
                success: false,
                message: "Please provide a stock symbol."
            });
        }

        const result = await getHistoricalMetrics(symbol);

        if (debug === "true") {
            const historical = await getHistoricalPrices(symbol);

            return res.status(200).json({
                ...result,
                validationData: {
                    prices: historical.prices,
                    fetchedAt: historical.fetchedAt
                }
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



const getActionEvidenceController = async (req, res) => {
    try {
        const { symbol } = req.query;

        if (!symbol || typeof symbol !== "string") {
            return res.status(400).json({
                success: false,
                message: "Please provide a stock symbol."
            });
        }

        const evidenceReport = await getActionEvidence({
            symbol,
            userId: req.userId
        });

        const ruleEvaluation = evaluateActionRules(evidenceReport);

        return res.status(200).json({
            ...evidenceReport,
            ruleEvaluation
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getMarketDataStatusController = async (req, res) => {
    try {
        const investments = await getInvestmentsWithCurrentValue(req.userId);

        const holdings = investments.map((investment) => ({
            symbol: investment.symbol,
            assetType: investment.assetType,
            marketDataAvailable: investment.marketDataAvailable,
            currentPrice: investment.currentPrice,
            marketDataError: investment.marketDataError
        }));

        return res.status(200).json({
            success: true,
            totalHoldings: holdings.length,
            availableHoldings: holdings.filter(
                (holding) => holding.marketDataAvailable
            ).length,
            unavailableHoldings: holdings.filter(
                (holding) => !holding.marketDataAvailable
            ).length,
            holdings
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
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
    getHistoricalMetricsController,
    getActionEvidenceController,
    getMarketDataStatusController,
};