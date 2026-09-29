// server/services/riskService.js

const {
    getPortfolioAnalytics
} = require("./portfolioService");

const User = require("../models/User");

// ========================================
// 1. Concentration Risk
// Maximum: 50 points
// ========================================

const calculateConcentrationRisk = (concentration) => {

    if (concentration < 0 || concentration > 100) {
        throw new Error(
            "Concentration must be between 0 and 100."
        );
    }

    if (concentration <= 25) {
        return 10;
    }
    else if (concentration <= 50) {
        return 25;
    }
    else if (concentration <= 75) {
        return 40;
    }
    else {
        return 50;
    }
};


// ========================================
// 2. Holdings Risk
// Maximum: 30 points
// ========================================

const calculateHoldingsRisk = (numberOfHoldings) => {

    if (numberOfHoldings < 1) {
        throw new Error("No holdings available.");
    }

    if (numberOfHoldings <= 2) {
        return 30;
    }
    else if (numberOfHoldings <= 5) {
        return 20;
    }
    else if (numberOfHoldings <= 10) {
        return 10;
    }
    else {
        return 0;
    }
};


// ========================================
// 3. Asset Diversification Risk
// Maximum: 20 points
// ========================================

const calculateAssetDiversificationRisk = (
    numberOfAssetTypes
) => {

    if (numberOfAssetTypes < 1) {
        throw new Error("No asset types available.");
    }

    if (numberOfAssetTypes <= 1) {
        return 20;
    }
    else if (numberOfAssetTypes <= 2) {
        return 12;
    }
    else if (numberOfAssetTypes <= 3) {
        return 6;
    }
    else {
        return 0;
    }
};


// ========================================
// 4. Overall Risk Score
// Maximum: 100 points
// ========================================

const calculateRiskScore = (
    concentration,
    numberOfHoldings,
    numberOfAssetTypes
) => {

    const concentrationRisk =
        calculateConcentrationRisk(concentration);

    const holdingsRisk =
        calculateHoldingsRisk(numberOfHoldings);

    const assetRisk =
        calculateAssetDiversificationRisk(numberOfAssetTypes);

    const totalRisk =
        concentrationRisk +
        holdingsRisk +
        assetRisk;

    return totalRisk;
};


// ========================================
// 5. Risk Level
// ========================================

const getRiskLevel = (riskScore) => {

    if (riskScore < 0 || riskScore > 100) {
        throw new Error(
            "Risk score must be between 0 and 100."
        );
    }

    if (riskScore <= 30) {
        return "Low";
    }
    else if (riskScore <= 60) {
        return "Moderate";
    }
    else if (riskScore <= 80) {
        return "High";
    }
    else {
        return "Very High";
    }
};


// ========================================
// 6. Generate Risk Reasons
// ========================================

const generateRiskReasons = (
    concentration,
    numberOfHoldings,
    numberOfAssetTypes
) => {

    const reasons = [];


    // Concentration
    if (concentration <= 25) {
        // No warning
    }
    else if (concentration <= 50) {
        reasons.push(
            "Your portfolio has moderate concentration."
        );
    }
    else if (concentration <= 75) {
        reasons.push(
            "Your portfolio has high concentration."
        );
    }
    else {
        reasons.push(
            "Your portfolio is highly concentrated."
        );
    }


    // Holdings
    if (numberOfHoldings <= 2) {
        reasons.push(
            "Your portfolio has very few holdings."
        );
    }
    else if (numberOfHoldings <= 5) {
        reasons.push(
            "Your portfolio has limited diversification across holdings."
        );
    }


    // Asset diversification
    if (numberOfAssetTypes === 1) {
        reasons.push(
            "Your portfolio contains only one asset type."
        );
    }
    else if (numberOfAssetTypes === 2) {
        reasons.push(
            "Your portfolio has limited diversification across asset types."
        );
    }

    return reasons;
};


// ========================================
// 7. Complete Portfolio Risk
// ========================================

const getPortfolioRisk = (
    concentration,
    numberOfHoldings,
    numberOfAssetTypes,
    riskPreference
) => {

    const concentrationRisk =
        calculateConcentrationRisk(concentration);

    const holdingsRisk =
        calculateHoldingsRisk(numberOfHoldings);

    const assetRisk =
        calculateAssetDiversificationRisk(numberOfAssetTypes);

    const riskScore =
        calculateRiskScore(
            concentration,
            numberOfHoldings,
            numberOfAssetTypes
        );

    const riskLevel =
        getRiskLevel(riskScore);

    const preferenceComparison =
        compareRiskWithPreference(
            riskLevel,
            riskPreference
        );    

    const reasons =
        generateRiskReasons(
            concentration,
            numberOfHoldings,
            numberOfAssetTypes
        );

    return {
        score: riskScore,

        level: riskLevel,

        factors: {
            concentration: concentrationRisk,
            holdings: holdingsRisk,
            assetDiversification: assetRisk
        },

        reasons: reasons,
        preference: {
            selected: riskPreference,
            comparison: preferenceComparison
        }
    };
};


// ========================================
// 8. Get Risk For Actual User
// ========================================

const getPortfolioRiskForUser = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const riskPreference = user.riskPreference;

    const analytics =
        await getPortfolioAnalytics(userId);

    const {
        concentration,
        numberOfHoldings,
        numberOfAssetTypes
    } = analytics.analytics;


    // User has no investments
    if (numberOfHoldings === 0) {

        return {
            score: 0,

            level: "No Portfolio",

            factors: {
                concentration: 0,
                holdings: 0,
                assetDiversification: 0
            },

            reasons: [
                "You don't have any investments in your portfolio yet."
            ]
        };
    }


    return getPortfolioRisk(
        concentration,
        numberOfHoldings,
        numberOfAssetTypes,
        riskPreference
    );
};

const compareRiskWithPreference = (
    riskLevel,
    riskPreference
) => {

    if (riskPreference === "Conservative") {

        if (riskLevel === "Low") {
            return {
                status: "Aligned",
                message: "Your portfolio risk is aligned with your selected preference."
            };
        }
        else {
            return {
                status: "Higher Than Preference",
                message: "Your portfolio risk is higher than your selected preference."
            };
        }
    }

    else if (riskPreference === "Moderate") {

        if (
            riskLevel === "Low" ||
            riskLevel === "Moderate"
        ) {
            return {
                status: "Aligned",
                message: "Your portfolio risk is aligned with your selected preference."
            };
        }
        else {
            return {
                status: "Higher Than Preference",
                message: "Your portfolio risk is higher than your selected preference."
            };
        }
    }

    else if (riskPreference === "Aggresive") {

        if (
            riskLevel === "Very High"
        ) {
            return {
                status: "Aligned",
                message: "Your portfolio risk is aligned with your selected preference."
            };
        }
        else {
            return {
                status: "Lower Than Preference",
                message: "Your portfolio risk is lower than your selected preference."
            };
        }
    }

    else {
        throw new Error("Invalid risk preference.");
    }
};

// ========================================
// Export Functions
// ========================================

module.exports = {
    calculateConcentrationRisk,
    calculateHoldingsRisk,
    calculateAssetDiversificationRisk,
    calculateRiskScore,
    getRiskLevel,
    generateRiskReasons,
    compareRiskWithPreference,
    getPortfolioRisk,
    getPortfolioRiskForUser
};