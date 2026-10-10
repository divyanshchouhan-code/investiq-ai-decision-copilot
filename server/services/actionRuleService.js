
const evaluateActionRules = (evidenceReport) => {
    if (!evidenceReport || evidenceReport.success !== true) {
        throw new Error("A valid evidence report is required.");
    }

    const metrics = evidenceReport.historicalMetrics;
    const portfolio = evidenceReport.portfolioContext;

    if (!metrics || !portfolio) {
        throw new Error("Historical metrics and portfolio context are required.");
    }

    const limitations = Array.isArray(evidenceReport.limitations)
        ? evidenceReport.limitations
        : [];

    const ruleFlags = [];
    const reviewNotes = [];

    const evidenceIsReady =
        evidenceReport.signalStatus === "EVIDENCE_READY_FOR_RULE_REVIEW" &&
        limitations.length === 0 &&
        portfolio.portfolioDataStatus === "COMPLETE" &&
        portfolio.isPartial === false;

    if (!evidenceIsReady) {
        return {
            success: true,
            symbol: evidenceReport.symbol,
            ruleStatus: "INSUFFICIENT_EVIDENCE",
            ruleFlags: [],
            reviewNotes: [
                "The evidence report is incomplete or has unresolved limitations.",
                ...limitations
            ],
            actionSignal: null,
            message: "No action signal was generated because the evidence did not pass the required checks."
        };
    }

    const weight = portfolio.portfolioWeight;
    const drawdown = metrics.maximumDrawdown;
    const volatility = metrics.annualizedVolatility;
    const oneMonthReturn = metrics.returns?.oneMonth;
    const threeMonthReturn = metrics.returns?.threeMonths;

    if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
        reviewNotes.push("Portfolio weight is missing or invalid.");
    } else if (weight > 25) {
        ruleFlags.push({
            rule: "HIGH_PORTFOLIO_CONCENTRATION",
            severity: "HIGH",
            observedValue: weight,
            threshold: 25,
            message: "The holding exceeds the provisional 25% portfolio concentration threshold."
        });
    }

    if (!Number.isFinite(drawdown)) {
        reviewNotes.push("Historical maximum drawdown is unavailable.");
    } else if (drawdown <= -25) {
        ruleFlags.push({
            rule: "SIGNIFICANT_HISTORICAL_DRAWDOWN",
            severity: "HIGH",
            observedValue: drawdown,
            threshold: -25,
            message: "Historical maximum drawdown reached or exceeded the provisional 25% decline threshold."
        });
    }

    if (!Number.isFinite(volatility)) {
        reviewNotes.push("Annualized historical volatility is unavailable.");
    } else if (volatility >= 40) {
        ruleFlags.push({
            rule: "ELEVATED_HISTORICAL_VOLATILITY",
            severity: "MEDIUM",
            observedValue: volatility,
            threshold: 40,
            message: "Annualized historical volatility reached the provisional 40% threshold."
        });
    }

    if (!Number.isFinite(oneMonthReturn)) {
        reviewNotes.push("The one-month historical return is unavailable.");
    } else if (oneMonthReturn < 0) {
        ruleFlags.push({
            rule: "NEGATIVE_ONE_MONTH_RETURN",
            severity: "MEDIUM",
            observedValue: oneMonthReturn,
            message: "The one-month historical return is negative."
        });
    }

    if (!Number.isFinite(threeMonthReturn)) {
        reviewNotes.push("The three-month historical return is unavailable.");
    } else if (threeMonthReturn < 0) {
        ruleFlags.push({
            rule: "NEGATIVE_THREE_MONTH_RETURN",
            severity: "MEDIUM",
            observedValue: threeMonthReturn,
            message: "The three-month historical return is negative."
        });
    }

    if (reviewNotes.length > 0) {
        return {
            success: true,
            symbol: evidenceReport.symbol,
            ruleStatus: "INSUFFICIENT_EVIDENCE",
            ruleFlags,
            reviewNotes,
            actionSignal: null,
            message: "Some required metrics are unavailable or invalid. Review the evidence before interpreting the rule flags."
        };
    }

    if (ruleFlags.length > 0) {
        return {
            success: true,
            symbol: evidenceReport.symbol,
            ruleStatus: "RISK_REVIEW_REQUIRED",
            ruleFlags,
            reviewNotes: [
                "One or more provisional risk rules were triggered.",
                "These flags identify areas for further review and do not determine whether to buy, hold, reduce, or sell."
            ],
            actionSignal: null,
            message: "Risk flags were detected. Review the underlying evidence before making an investment decision."
        };
    }

    return {
        success: true,
        symbol: evidenceReport.symbol,
        ruleStatus: "NO_RULE_FLAGS",
        ruleFlags: [],
        reviewNotes: [
            "None of the configured provisional rules were triggered.",
            "This does not mean the investment is safe or suitable."
        ],
        actionSignal: null,
        message: "No configured rule flags were triggered. This result is not an investment recommendation."
    };
};

module.exports = {
    evaluateActionRules
};
