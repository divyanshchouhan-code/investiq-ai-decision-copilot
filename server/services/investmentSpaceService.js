const {
    getInvestmentsWithCurrentValue
} = require("./portfolioDataService");

const {
    calculateAllocation,
    findLargestHolding
} = require("./portfolioService");

const {
    getPortfolioRisk
} = require("./riskService");

const {
    generateInvestmentInsights
} = require("./insightService");

const User = require("../models/User");


const getInvestmentSpaceData = async (userId) => {

    if (!userId) {
        throw new Error("User ID is required.");
    }


    // --------------------------------
    // GET USER
    // --------------------------------

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }


    // --------------------------------
    // GET INVESTMENTS + CURRENT PRICES
    // --------------------------------

    const investmentsWithValue =
        await getInvestmentsWithCurrentValue(userId);


    // --------------------------------
    // EMPTY PORTFOLIO
    // --------------------------------

    if (investmentsWithValue.length === 0) {

        return {
            summary: {
                totalInvested: 0,
                currentValue: 0,
                totalPnL: 0,
                returnPercentage: 0,
                numberOfHoldings: 0
            },

            analytics: {
                allocation: {},
                largestHolding: null,
                concentration: 0,
                numberOfHoldings: 0,
                numberOfAssetTypes: 0
            },

            risk: {
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
            },

            insights: [
                "You don't have any investments in your portfolio yet."
            ]
        };
    }


    // --------------------------------
    // SUMMARY
    // --------------------------------

    let totalInvested = 0;
    let currentValue = 0;


    for (const investment of investmentsWithValue) {

        totalInvested += investment.investedValue;

        currentValue += investment.currentValue;
    }


    const totalPnL =
        currentValue - totalInvested;


    const returnPercentage =
        totalInvested > 0
            ? (totalPnL / totalInvested) * 100
            : 0;


    const summary = {

        totalInvested:
            Number(totalInvested.toFixed(2)),

        currentValue:
            Number(currentValue.toFixed(2)),

        totalPnL:
            Number(totalPnL.toFixed(2)),

        returnPercentage:
            Number(returnPercentage.toFixed(2)),

        numberOfHoldings:
            investmentsWithValue.length
    };


    // --------------------------------
    // ANALYTICS
    // --------------------------------

    const allocation =
        calculateAllocation(
            investmentsWithValue
        );


    const largestHolding =
        findLargestHolding(
            investmentsWithValue
        );


    const totalValue =
        investmentsWithValue.reduce(
            (total, investment) =>
                total + investment.currentValue,
            0
        );


    const concentration =
        totalValue > 0
            ? (
                largestHolding.currentValue /
                totalValue
            ) * 100
            : 0;


    const assetTypes =
        new Set(
            investmentsWithValue.map(
                investment =>
                    investment.assetType
            )
        );


    const analytics = {

        allocation,

        largestHolding,

        concentration:
            Number(
                concentration.toFixed(2)
            ),

        numberOfHoldings:
            investmentsWithValue.length,

        numberOfAssetTypes:
            assetTypes.size
    };


    // --------------------------------
    // RISK
    // --------------------------------

    const risk =
        getPortfolioRisk(
            analytics.concentration,
            analytics.numberOfHoldings,
            analytics.numberOfAssetTypes,
            user.riskPreference
        );


    // --------------------------------
    // INSIGHTS
    // --------------------------------

    const insights =
        generateInvestmentInsights(
            analytics.concentration,
            analytics.numberOfHoldings,
            analytics.numberOfAssetTypes,
            analytics.largestHolding
        );


    // --------------------------------
    // FINAL RESPONSE
    // --------------------------------

    return {

        summary,

        analytics,

        risk,

        insights

    };
};


module.exports = {
    getInvestmentSpaceData
};  