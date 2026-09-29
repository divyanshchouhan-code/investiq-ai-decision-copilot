const {
    generateAIResponse,
    generatePortfolioAnalysis,
    generatePortfolioChatResponse
} = require("../services/aiService");

const {
    getPortfolioAnalytics
} = require("../services/portfolioService");

const {
    getPortfolioRiskForUser
} = require("../services/riskService");

const {
    getInvestmentInsightsForUser
} = require("../services/insightService");

const testAI = async (req, res) => {
    try {
        const response = await generateAIResponse(
            "Explain portfolio diversification in simple words."
        );

        return res.status(200).json({
            success: true,
            response
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getPortfolioAIAnalysis = async (req, res) => {
    try {
        const userId = req.userId;

        const analytics =
            await getPortfolioAnalytics(userId);

        const risk =
            await getPortfolioRiskForUser(userId);

        const insights =
            await getInvestmentInsightsForUser(userId);

        const portfolioData = {
            currency: "INR",
            analytics: analytics.analytics,
            risk,
            insights: insights.insights
        };

        const response =
            await generatePortfolioAnalysis(portfolioData);

        return res.status(200).json({
            success: true,
            analysis: response
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const chatWithPortfolioAI = async (req, res) => {
    try {
        const userId = req.userId;

        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

        const analytics =
            await getPortfolioAnalytics(userId);

        const risk =
            await getPortfolioRiskForUser(userId);

        const insights =
            await getInvestmentInsightsForUser(userId);

        const portfolioData = {
            currency: "INR",
            analytics: analytics.analytics,
            risk,
            insights: insights.insights
        };

        const response =
            await generatePortfolioChatResponse(
                portfolioData,
                question
            );

        return res.status(200).json({
            success: true,
            question,
            response
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    testAI,
    getPortfolioAIAnalysis,
    chatWithPortfolioAI
};