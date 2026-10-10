
const User = require("../models/User");

const {
    getInvestmentsWithCurrentValue
} = require("./portfolioDataService");

const {
    getHistoricalMetrics
} = require("./historicalMetricsService");

const getActionEvidence = async ({ symbol, userId }) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    if (!symbol || typeof symbol !== "string" || !symbol.trim()) {
        throw new Error("A valid investment symbol is required.");
    }

    const normalizedSymbol = symbol.trim().toUpperCase();

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const investments = await getInvestmentsWithCurrentValue(userId);

    const valuedInvestments = investments.filter(
        (investment) =>
            investment.marketDataAvailable !== false &&
            Number.isFinite(investment.currentValue) &&
            investment.currentValue > 0
    );

    const totalPortfolioValue = valuedInvestments.reduce(
        (total, investment) => total + investment.currentValue,
        0
    );

    if (totalPortfolioValue <= 0) {
        throw new Error(
            "Portfolio value is unavailable. Add investments with valid current market prices before requesting action evidence."
        );
    }

    const matchingInvestments = valuedInvestments.filter(
        (investment) =>
            investment.symbol.toUpperCase() === normalizedSymbol
    );

    if (matchingInvestments.length === 0) {
        throw new Error(
            "This symbol has no investment with an available current market value in your portfolio."
        );
    }

    const holdingValue = matchingInvestments.reduce(
        (total, investment) => total + investment.currentValue,
        0
    );

    const portfolioWeight = Number(
        ((holdingValue / totalPortfolioValue) * 100).toFixed(2)
    );

    const riskPreference = user.riskPreference || "Moderate";

    const historical = await getHistoricalMetrics(normalizedSymbol);

    const supportingEvidence = [];
    const opposingEvidence = [];
    const contextEvidence = [];
    const limitations = [];

    const returns = historical.returns || {};
    const quality = historical.evidenceQuality || {};

    const hasUnavailableHoldings =
        valuedInvestments.length !== investments.length;

    if (hasUnavailableHoldings) {
        limitations.push(
            "Some portfolio holdings have unavailable market values, so the calculated portfolio weight excludes those holdings."
        );
    }

    if (quality.status !== "SUFFICIENT_HISTORY") {
        limitations.push(
            "Historical data quality requires review before this evidence can support an action signal."
        );
    }

    if (returns.oneMonth !== null && returns.oneMonth !== undefined) {
        if (returns.oneMonth > 0) {
            supportingEvidence.push(
                `The 1-month historical return is positive at ${returns.oneMonth}%.`
            );
        } else if (returns.oneMonth < 0) {
            opposingEvidence.push(
                `The 1-month historical return is negative at ${returns.oneMonth}%.`
            );
        } else {
            contextEvidence.push(
                "The 1-month historical return is approximately zero."
            );
        }
    } else {
        limitations.push("The 1-month return is unavailable.");
    }

    if (returns.threeMonths !== null && returns.threeMonths !== undefined) {
        if (returns.threeMonths > 0) {
            supportingEvidence.push(
                `The 3-month historical return is positive at ${returns.threeMonths}%.`
            );
        } else if (returns.threeMonths < 0) {
            opposingEvidence.push(
                `The 3-month historical return is negative at ${returns.threeMonths}%.`
            );
        } else {
            contextEvidence.push(
                "The 3-month historical return is approximately zero."
            );
        }
    } else {
        limitations.push("The 3-month return is unavailable.");
    }

    if (
        historical.annualizedVolatility !== null &&
        historical.annualizedVolatility !== undefined
    ) {
        contextEvidence.push(
            `Annualized historical volatility is ${historical.annualizedVolatility}%.`
        );

        if (historical.annualizedVolatility >= 40) {
            opposingEvidence.push(
                "Historical volatility is elevated under the provisional 40% threshold."
            );
        }
    } else {
        limitations.push("Historical volatility is unavailable.");
    }

    if (
        historical.maximumDrawdown !== null &&
        historical.maximumDrawdown !== undefined
    ) {
        contextEvidence.push(
            `Historical maximum drawdown is ${historical.maximumDrawdown}%.`
        );

        if (historical.maximumDrawdown <= -25) {
            opposingEvidence.push(
                "The historical maximum drawdown reached at least 25% under the provisional threshold."
            );
        }
    } else {
        limitations.push("Historical maximum drawdown is unavailable.");
    }

    contextEvidence.push(
        `This holding represents ${portfolioWeight}% of the valued portfolio.`
    );

    if (portfolioWeight > 25) {
        opposingEvidence.push(
            "This holding exceeds the provisional 25% portfolio concentration threshold."
        );
    }

    if (
        !["Conservative", "Moderate", "Aggressive"].includes(riskPreference)
    ) {
        limitations.push("The user's saved risk preference is not recognized.");
    } else {
        contextEvidence.push(
            `The user's saved risk preference is ${riskPreference}. Suitability has not been established.`
        );
    }

    const eligibleForSignal =
        quality.status === "SUFFICIENT_HISTORY" &&
        limitations.length === 0;

    return {
        success: true,
        symbol: normalizedSymbol,
        historicalMetrics: {
            latestPrice: historical.latestPrice,
            latestDate: historical.latestDate,
            returns: historical.returns,
            annualizedVolatility: historical.annualizedVolatility,
            maximumDrawdown: historical.maximumDrawdown
        },
        portfolioContext: {
            holdingValue: Number(holdingValue.toFixed(2)),
            totalPortfolioValue: Number(totalPortfolioValue.toFixed(2)),
            portfolioWeight,
            riskPreference,
            valuedHoldings: valuedInvestments.length,
            totalHoldings: investments.length,
            unavailableHoldings: investments.length - valuedInvestments.length,
            portfolioDataStatus: hasUnavailableHoldings
                ? "INCOMPLETE"
                : "COMPLETE",
            isPartial: hasUnavailableHoldings
        },
        supportingEvidence,
        opposingEvidence,
        contextEvidence,
        limitations,
        signalStatus: eligibleForSignal
            ? "EVIDENCE_READY_FOR_RULE_REVIEW"
            : "INSUFFICIENT_EVIDENCE",
        actionSignal: null,
        message: "This report summarizes historical and portfolio evidence. It does not independently determine whether to buy, hold, reduce, or sell."
    };
};

module.exports = {
    getActionEvidence
};
