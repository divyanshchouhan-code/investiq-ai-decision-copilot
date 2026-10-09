const generateActionForHolding = ({
    holding,
    portfolioRisk,
    concentration,
    riskPreference,
    totalPortfolioValue,
}) => {

    const reasons = [];
    const factors = [];

    const holdingValue = holding.currentValue;

    const holdingPercentage =
        totalPortfolioValue > 0
            ? (holdingValue / totalPortfolioValue) * 100
            : 0;

    const returnPercentage =
        holding.investedValue > 0
            ? (
                (holding.currentValue - holding.investedValue) /
                holding.investedValue
            ) * 100
            : 0;


    // --------------------------------
    // CONCENTRATION
    // --------------------------------

    if (holdingPercentage >= 75) {

        reasons.push(
            `${holding.symbol} represents ${holdingPercentage.toFixed(2)}% of your portfolio, creating high concentration risk.`
        );

        factors.push({
            type: "concentration",
            value: Number(holdingPercentage.toFixed(2)),
            impact: "high",
        });

    } else if (holdingPercentage >= 50) {

        reasons.push(
            `${holding.symbol} represents ${holdingPercentage.toFixed(2)}% of your portfolio, creating meaningful concentration.`
        );

        factors.push({
            type: "concentration",
            value: Number(holdingPercentage.toFixed(2)),
            impact: "medium",
        });
    }


    // --------------------------------
    // PORTFOLIO RISK
    // --------------------------------

    if (
        portfolioRisk &&
        (
            portfolioRisk.level === "High" ||
            portfolioRisk.level === "Very High"
        )
    ) {

        reasons.push(
            `Your overall portfolio risk is ${portfolioRisk.level.toLowerCase()}.`
        );

        factors.push({
            type: "portfolioRisk",
            value: portfolioRisk.score,
            impact: "high",
        });
    }


    // --------------------------------
    // RISK PREFERENCE
    // --------------------------------

    if (
        portfolioRisk &&
        portfolioRisk.preference &&
        portfolioRisk.preference.comparison &&
        portfolioRisk.preference.comparison.status ===
        "Higher Than Preference"
    ) {

        reasons.push(
            `Your portfolio risk is higher than your selected ${riskPreference} risk preference.`
        );

        factors.push({
            type: "riskPreference",
            value: riskPreference,
            impact: "high",
        });
    }


    // --------------------------------
    // PERFORMANCE
    // --------------------------------

    if (returnPercentage >= 30) {

        reasons.push(
            `${holding.symbol} is currently showing a ${returnPercentage.toFixed(2)}% gain from its purchase price.`
        );

        factors.push({
            type: "performance",
            value: Number(returnPercentage.toFixed(2)),
            impact: "positive",
        });

    } else if (returnPercentage <= -20) {

        reasons.push(
            `${holding.symbol} is currently down ${Math.abs(returnPercentage).toFixed(2)}% from its purchase price.`
        );

        factors.push({
            type: "performance",
            value: Number(returnPercentage.toFixed(2)),
            impact: "negative",
        });
    }


    // --------------------------------
    // ACTION SCORE
    // --------------------------------

    let reduceScore = 0;
    let addScore = 0;


    // Concentration strongly supports reducing exposure.
    if (holdingPercentage >= 75) {
        reduceScore += 3;
    } else if (holdingPercentage >= 50) {
        reduceScore += 2;
    }


    // High portfolio risk supports reducing exposure.
    if (
        portfolioRisk &&
        portfolioRisk.level === "Very High"
    ) {
        reduceScore += 3;

    } else if (
        portfolioRisk &&
        portfolioRisk.level === "High"
    ) {
        reduceScore += 2;
    }


    // Risk above user's preference supports reducing exposure.
    if (
        portfolioRisk &&
        portfolioRisk.preference &&
        portfolioRisk.preference.comparison &&
        portfolioRisk.preference.comparison.status ===
        "Higher Than Preference"
    ) {
        reduceScore += 2;
    }


    /*
     * A strong negative return alone does NOT trigger ADD.
     *
     * We only record it as supporting evidence.
     */

    if (returnPercentage <= -20) {
        addScore += 1;
    }


    // --------------------------------
    // DETERMINE SIGNAL
    // --------------------------------

    let signal = "HOLD";


    /*
     * REDUCE
     *
     * We need strong portfolio-level evidence.
     */

    if (reduceScore >= 5) {

        signal = "REDUCE";

    }


    /*
     * ADD
     *
     * For the current MVP we keep ADD conservative.
     *
     * A holding showing a loss is not enough to recommend
     * adding more money to it.
     *
     * Therefore ADD is reserved for a future version
     * when market/fundamental evidence is available.
     */

    else if (
        addScore >= 3 &&
        holdingPercentage < 25 &&
        portfolioRisk &&
        portfolioRisk.level !== "Very High"
    ) {

        signal = "ADD";

    }


    /*
     * EXIT
     *
     * We deliberately do not automatically generate EXIT
     * from the current portfolio-only data.
     *
     * EXIT should require stronger evidence such as:
     * - sustained negative trend
     * - fundamental deterioration
     * - severe volatility
     * - user-defined conditions
     *
     * These can be added when richer market data is integrated.
     */


    // --------------------------------
    // REASON
    // --------------------------------

    let reason;

    if (signal === "REDUCE") {

        reason =
            reasons.length > 0
                ? reasons[0]
                : "Portfolio-level risk signals suggest reducing exposure should be considered.";

    } else if (signal === "ADD") {

        reason =
            "Available portfolio signals support considering additional exposure, but further market evidence should be evaluated.";

    } else if (signal === "EXIT") {

        reason =
            "Multiple negative signals indicate that exiting the position may need consideration.";

    } else {

        reason =
            "No strong portfolio-level action signal was identified from the available data.";
    }


    // --------------------------------
    // FINAL RESPONSE
    // --------------------------------

    return {
        symbol: holding.symbol,

        signal,

        confidence:
            reasons.length >= 3
                ? "Multiple portfolio factors support this signal"
                : reasons.length > 0
                    ? "Supported by available portfolio data"
                    : "Limited portfolio evidence",

        reason,

        reasons,

        factors,

        metrics: {
            concentration: Number(
                holdingPercentage.toFixed(2)
            ),

            returnPercentage: Number(
                returnPercentage.toFixed(2)
            ),

            currentValue:
                holding.currentValue,

            investedValue:
                holding.investedValue,
        },
    };
};


const getPortfolioActions = ({
    investments,
    portfolioRisk,
    riskPreference,
}) => {

    if (!investments || investments.length === 0) {
        return [];
    }


    const totalPortfolioValue =
        investments.reduce(
            (total, investment) =>
                total + investment.currentValue,
            0
        );


    return investments.map(
        (holding) =>
            generateActionForHolding({
                holding,
                portfolioRisk,
                riskPreference,
                totalPortfolioValue,
            })
    );
};


module.exports = {
    generateActionForHolding,
    getPortfolioActions,
};