const Investment = require("../models/Investment");
const User = require("../models/User");
const {
    getInvestmentsWithCurrentValue
} = require("./portfolioDataService");

const addInvestment = async (investmentData, userId) => {
    const {
        symbol,
        quantity,
        buyPrice,
        purchaseDate,
        assetType
    } = investmentData;

    if (!userId) {
        throw new Error("User ID is required.");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const investment = await Investment.create({
        userId,
        symbol,
        quantity,
        buyPrice,
        purchaseDate,
        assetType
    });

    return {
        success: true,
        message: "Investment created successfully",
        investment,
    };
};

const fetchInvestments = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const investments = await Investment.find({ userId });

    return {
        success: true,
        investments,
    };
};

const fetchInvestmentById = async (investmentId, userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const investment = await Investment.findOne({
        _id: investmentId,
        userId,
    });

    if (!investment) {
        throw new Error("Investment not found.");
    }

    return {
        success: true,
        investment,
    };
};


const updateInvestment = async(investmentId, userId, updateData) => {
    if(!userId){
        throw new Error("User Id is required.")
    }

    const investment = await Investment.findOneAndUpdate(
       { _id: investmentId,
        userId,},
        updateData,
        {
            new: true,
            runvalidators: true,
        }
    );

    if(!investment){
        throw new Error("Investment not found.");
    }

    return {
        success: true,
        message: "Investment Updated Successfully.",
        investment,
    };
};

const deleteInvestment = async (investmentId, userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const investment = await Investment.findOneAndDelete({
        _id: investmentId,
        userId,
    });

    if (!investment) {
        throw new Error("Investment not found.");
    }

    return {
        success: true,
        message: "Investment deleted successfully",
    };
};


const getPortfolioSummary = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const investments = await getInvestmentsWithCurrentValue(userId);

    if (investments.length === 0) {
        return {
            success: true,
            summary: {
                totalInvested: 0,
                currentValue: 0,
                totalPnL: 0,
                returnPercentage: 0,
                numberOfHoldings: 0,
            },
        };
    }

    let totalInvested = 0;
    let currentValue = 0;

    for (const investment of investments) {
        totalInvested += investment.investedValue;
        currentValue += investment.currentValue;
    }

    const totalPnL = currentValue - totalInvested;

    const returnPercentage =
        totalInvested > 0
            ? (totalPnL / totalInvested) * 100
            : 0;

    return {
        success: true,
        summary: {
            totalInvested: Number(totalInvested.toFixed(2)),
            currentValue: Number(currentValue.toFixed(2)),
            totalPnL: Number(totalPnL.toFixed(2)),
            returnPercentage: Number(returnPercentage.toFixed(2)),
            numberOfHoldings: investments.length,
        },
    };
};



const calculateAllocation = (investmentsWithValue) => {
    let total = 0;
    const allocation = {};

    for (const investment of investmentsWithValue) {
        total += investment.currentValue;

        if (!allocation[investment.assetType]) {
            allocation[investment.assetType] = 0;
        }

        allocation[investment.assetType] += investment.currentValue;
    }

    if (total === 0) {
        return {};
    }

    for (const assetType in allocation) {
        allocation[assetType] = Number(
            ((allocation[assetType] / total) * 100).toFixed(2)
        );
    }

    return allocation;
};

const findLargestHolding = (investmentsWithValue) => {
    if (investmentsWithValue.length === 0) {
        return null;
    }

    let largest = investmentsWithValue[0];

    for (const investment of investmentsWithValue) {
        if (investment.currentValue > largest.currentValue) {
            largest = investment;
        }
    }

    return largest;
};


const getPortfolioAnalytics = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const investmentsWithValue =
        await getInvestmentsWithCurrentValue(userId);

    if (investmentsWithValue.length === 0) {
        return {
            success: true,
            analytics: {
                allocation: {},
                largestHolding: null,
                concentration: 0,
                numberOfHoldings: 0,
                numberOfAssetTypes: 0,
            },
        };
    }

    const allocation =
        calculateAllocation(investmentsWithValue);

    const largestHolding =
        findLargestHolding(investmentsWithValue);

    const totalValue = investmentsWithValue.reduce(
        (total, investment) =>
            total + investment.currentValue,
        0
    );

    const concentration =
        totalValue > 0
            ? (largestHolding.currentValue / totalValue) * 100
            : 0;

    const assetTypes = new Set(
        investmentsWithValue.map(
            (investment) => investment.assetType
        )
    );

    return {
        success: true,
        analytics: {
            allocation,
            largestHolding,
            concentration: Number(concentration.toFixed(2)),
            numberOfHoldings: investmentsWithValue.length,
            numberOfAssetTypes: assetTypes.size,
        },
    };
};




module.exports = {
    addInvestment,
    fetchInvestments,
    fetchInvestmentById,
    updateInvestment,
    deleteInvestment,
    getPortfolioSummary,
    calculateAllocation,
    findLargestHolding,
    getPortfolioAnalytics,
};