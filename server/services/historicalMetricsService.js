
const { getHistoricalPrices } = require("./historicalDataService");

const MIN_OBSERVATIONS = 60;
const MAX_DAILY_CHANGE_PERCENT = 20;

const calculateReturn = (startPrice, endPrice) => {
    if (
        !Number.isFinite(startPrice) ||
        !Number.isFinite(endPrice) ||
        startPrice <= 0 ||
        endPrice <= 0
    ) {
        return null;
    }

    return Number(
        (((endPrice - startPrice) / startPrice) * 100).toFixed(2)
    );
};

const calculateVolatility = (prices) => {
    if (prices.length < 3) {
        return null;
    }

    const returns = [];

    for (let i = 1; i < prices.length; i++) {
        returns.push(
            Math.log(prices[i].close / prices[i - 1].close)
        );
    }

    const mean =
        returns.reduce((sum, value) => sum + value, 0) /
        returns.length;

    const variance =
        returns.reduce(
            (sum, value) => sum + Math.pow(value - mean, 2),
            0
        ) /
        (returns.length - 1);

    return Number(
        (Math.sqrt(variance) * Math.sqrt(252) * 100).toFixed(2)
    );
};

const calculateMaximumDrawdown = (prices) => {
    if (prices.length < 2) {
        return null;
    }

    let peak = prices[0].close;
    let maximumDrawdown = 0;

    for (const item of prices) {
        if (item.close > peak) {
            peak = item.close;
        }

        const drawdown = ((item.close - peak) / peak) * 100;

        if (drawdown < maximumDrawdown) {
            maximumDrawdown = drawdown;
        }
    }

    return Number(maximumDrawdown.toFixed(2));
};

const getReturnForPeriod = (prices, calendarDays) => {
    if (prices.length < 2) {
        return null;
    }

    const latest = prices[prices.length - 1];
    const targetDate = new Date(latest.date);

    targetDate.setUTCDate(
        targetDate.getUTCDate() - calendarDays
    );

    let startPrice = null;

    for (const item of prices) {
        if (Date.parse(item.date) >= targetDate.getTime()) {
            startPrice = item;
            break;
        }
    }

    if (!startPrice || startPrice.date === latest.date) {
        return null;
    }

    return calculateReturn(startPrice.close, latest.close);
};

const validatePriceSeries = (prices) => {
    const issues = [];
    const suspiciousChanges = [];

    if (!Array.isArray(prices) || prices.length < 2) {
        return {
            valid: false,
            issues: ["INSUFFICIENT_PRICE_DATA"],
            suspiciousChanges,
        };
    }

    for (let i = 0; i < prices.length; i++) {
        const item = prices[i];

        if (
            !item.date ||
            !Number.isFinite(Date.parse(item.date)) ||
            !Number.isFinite(item.close) ||
            item.close <= 0
        ) {
            issues.push("INVALID_PRICE_OBSERVATION");
            break;
        }

        if (i > 0) {
            const previous = prices[i - 1];

            if (Date.parse(item.date) <= Date.parse(previous.date)) {
                issues.push("DATES_NOT_STRICTLY_INCREASING");
                break;
            }

            const dailyChange =
                ((item.close - previous.close) / previous.close) * 100;

            if (Math.abs(dailyChange) > MAX_DAILY_CHANGE_PERCENT) {
                suspiciousChanges.push({
                    date: item.date,
                    previousDate: previous.date,
                    changePercent: Number(dailyChange.toFixed(2)),
                });
            }
        }
    }

    if (prices.length < MIN_OBSERVATIONS) {
        issues.push("INSUFFICIENT_HISTORY");
    }

    if (suspiciousChanges.length > 0) {
        issues.push("UNUSUAL_DAILY_PRICE_MOVEMENT");
    }

    return {
        valid: !issues.includes("INVALID_PRICE_OBSERVATION") &&
            !issues.includes("DATES_NOT_STRICTLY_INCREASING"),
        issues,
        suspiciousChanges,
    };
};

const getHistoricalMetrics = async (symbol) => {
    const historical = await getHistoricalPrices(symbol);
    const prices = historical.prices;
    const latestPrice = prices[prices.length - 1];
    const validation = validatePriceSeries(prices);

    const metrics = {
        success: true,
        symbol: historical.symbol,
        latestPrice: latestPrice.close,
        latestDate: latestPrice.date,
        observations: historical.observations,
        returns: {
            oneMonth: getReturnForPeriod(prices, 30),
            threeMonths: getReturnForPeriod(prices, 90),
            sixMonths: getReturnForPeriod(prices, 180),
        },
        annualizedVolatility: calculateVolatility(prices),
        maximumDrawdown: calculateMaximumDrawdown(prices),
        evidenceQuality: {
            status: !validation.valid
                ? "INVALID_DATA"
                : validation.issues.length > 0
                    ? "REVIEW_REQUIRED"
                    : "SUFFICIENT_HISTORY",
            observations: prices.length,
            oldestDate: historical.oldestDate,
            latestDate: historical.latestDate,
            issues: validation.issues,
            suspiciousChanges: validation.suspiciousChanges,
        },
        fetchedAt: historical.fetchedAt,
    };

    return metrics;
};

module.exports = {
    getHistoricalMetrics,
};
