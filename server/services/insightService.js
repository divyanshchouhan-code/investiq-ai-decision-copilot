const {
    getPortfolioAnalytics
} = require("./portfolioService");

const {
    getPortfolioRiskForUser
} = require("./riskService");


// ========================================
// 1. Concentration Insight
// ========================================

const generateConcentrationInsight = (concentration) => {

    if (concentration <= 25) {
        return null;
    }
    else if (concentration <= 50) {
        return "Your portfolio has moderate concentration.";
    }
    else if (concentration <= 75) {
        return "Your portfolio has high concentration.";
    }
    else {
        return "Your portfolio has very high concentration in a single holding.";
    }
};


// ========================================
// 2. Holdings Insight
// ========================================

const generateHoldingsInsight = (numberOfHoldings) => {

    if (numberOfHoldings <= 2) {
        return "Your portfolio has very few holdings, which may increase concentration risk.";
    }
    else if (numberOfHoldings <= 5) {
        return "Your portfolio has limited diversification across holdings.";
    }
    else {
        return null;
    }
};


// ========================================
// 3. Asset Diversification Insight
// ========================================

const generateAssetDiversificationInsight = (
    numberOfAssetTypes
) => {

    if (numberOfAssetTypes === 1) {
        return "Your portfolio contains only one asset type, which limits diversification.";
    }
    else if (numberOfAssetTypes === 2) {
        return "Your portfolio has limited diversification across asset types.";
    }
    else {
        return null;
    }
};

// 4. Largest Holding Insight
const generateLargestHoldingInsight = (
    largestHolding,
    concentration
) => {
    if (!largestHolding) {
        return null;
    }

    return `${largestHolding.symbol} is your largest holding and represents ${concentration}% of your portfolio value.`;
};

// 5. P&L Insight

const generatePnLInsight = (largestHolding) => {
    if (!largestHolding) {
        return null;
    }

    const pnl =
        largestHolding.currentValue -
        largestHolding.investedValue;

    const returnPercentage =
        largestHolding.investedValue > 0
            ? (pnl / largestHolding.investedValue) * 100
            : 0;

    if (pnl > 0) {
        return `${largestHolding.symbol} is currently showing a profit of ${pnl.toFixed(2)}, representing a ${returnPercentage.toFixed(2)}% return on your investment.`;
    }
    else if (pnl < 0) {
        return `${largestHolding.symbol} is currently showing a loss of ${Math.abs(pnl).toFixed(2)}, representing a ${Math.abs(returnPercentage).toFixed(2)}% decline on your investment.`;
    }
    else {
        return `${largestHolding.symbol} is currently at breakeven with a 0% return.`;
    }
};

// 6. Risk Preference Insight
const generateRiskPreferenceInsight = (risk) => {
    if (!risk || !risk.preference) {
        return null;
    }

    const comparison = risk.preference.comparison;

    if (!comparison) {
        return null;
    }

    return comparison.message;
};

const generateInvestmentInsights = (
    concentration,
    numberOfHoldings,
    numberOfAssetTypes,
    largestHolding
) => {
    const insights = [];

    const concentrationInsight =
        generateConcentrationInsight(concentration);

    if (concentrationInsight) {
        insights.push(concentrationInsight);
    }

    const holdingsInsight =
        generateHoldingsInsight(numberOfHoldings);

    if (holdingsInsight) {
        insights.push(holdingsInsight);
    }

    const assetDiversificationInsight =
        generateAssetDiversificationInsight(numberOfAssetTypes);

    if (assetDiversificationInsight) {
        insights.push(assetDiversificationInsight);
    }

    const largestHoldingInsight =
        generateLargestHoldingInsight(largestHolding,concentration);

    if (largestHoldingInsight) {
        insights.push(largestHoldingInsight);
    }

    const pnlInsight = generatePnLInsight(largestHolding);

    if (pnlInsight) {
        insights.push(pnlInsight);
    }

    return insights;
};

const getInvestmentInsightsForUser = async (userId) => {

    const analytics =
        await getPortfolioAnalytics(userId);

    const risk =
        await getPortfolioRiskForUser(userId);

    const {
        concentration,
        numberOfHoldings,
        numberOfAssetTypes,
        largestHolding
    } = analytics.analytics;

    // No portfolio
    if (numberOfHoldings === 0) {
        return {
            insights: [
                "You don't have any investments in your portfolio yet."
            ]
        };
    }

    const insights = generateInvestmentInsights(
        concentration,
        numberOfHoldings,
        numberOfAssetTypes,
        largestHolding
    );

    const riskPreferenceInsight = generateRiskPreferenceInsight(risk);

    if (riskPreferenceInsight) {
        insights.push(riskPreferenceInsight);
    }

    return {
        insights
    };
};




// ========================================
// Export Functions
// ========================================

module.exports = {
    generateConcentrationInsight,
    generateHoldingsInsight,
    generateAssetDiversificationInsight,
    generateLargestHoldingInsight,
    generatePnLInsight,
    generateRiskPreferenceInsight,
    generateInvestmentInsights,
    getInvestmentInsightsForUser
};