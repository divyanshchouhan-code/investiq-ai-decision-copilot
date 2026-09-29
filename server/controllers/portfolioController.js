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
};