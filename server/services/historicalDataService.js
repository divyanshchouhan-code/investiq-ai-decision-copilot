
const axios = require("axios");

const historicalCache = new Map();
const pendingRequests = new Map();

const CACHE_DURATION = 6 * 60 * 60 * 1000;
const RATE_LIMIT_COOLDOWN = 15 * 1000;

let rateLimitUntil = 0;

const getHistoricalPrices = async (symbol) => {
    if (typeof symbol !== "string" || !symbol.trim()) {
        throw new Error("Symbol is required.");
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const cached = historicalCache.get(normalizedSymbol);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return {
            ...cached.data,
            cached: true,
        };
    }

    if (cached) {
        historicalCache.delete(normalizedSymbol);
    }

    if (Date.now() < rateLimitUntil) {
        throw new Error(
            "Historical market data is temporarily rate limited. Please try again later."
        );
    }

    if (pendingRequests.has(normalizedSymbol)) {
        return pendingRequests.get(normalizedSymbol);
    }

    const requestPromise = fetchHistoricalPrices(normalizedSymbol);

    pendingRequests.set(normalizedSymbol, requestPromise);

    try {
        return await requestPromise;
    } finally {
        pendingRequests.delete(normalizedSymbol);
    }
};

const fetchHistoricalPrices = async (symbol) => {
    try {
        const apiKey = process.env.TWELVE_DATA_API_KEY;

        if (!apiKey) {
            throw new Error("Market data API key is not configured.");
        }

        const response = await axios.get(
            "https://api.twelvedata.com/time_series",
            {
                params: {
                    symbol,
                    interval: "1day",
                    outputsize: 260,
                    order: "desc",
                    apikey: apiKey,
                },
                timeout: 15000,
            }
        );

        const data = response.data;

        if (data?.status === "error" || !Array.isArray(data?.values)) {
            const message =
                data?.message || "Historical prices are unavailable for this symbol.";

            if (
                data?.code === 429 ||
                data?.code === "429" ||
                /rate.?limit|too many requests|credits/i.test(message)
            ) {
                rateLimitUntil = Date.now() + RATE_LIMIT_COOLDOWN;
                throw new Error(
                    "Twelve Data rate limit reached. Please wait before trying again."
                );
            }

            throw new Error(message);
        }

        const prices = data.values
            .map((item) => ({
                date: item.datetime,
                close: Number(item.close),
            }))
            .filter(
                (item) =>
                    item.date &&
                    Number.isFinite(item.close) &&
                    item.close > 0 &&
                    !Number.isNaN(Date.parse(item.date))
            )
            .sort(
                (a, b) =>
                    Date.parse(a.date) - Date.parse(b.date)
            );

        if (prices.length < 2) {
            throw new Error(
                "Not enough historical price data is available for this symbol."
            );
        }

        const result = {
            success: true,
            symbol,
            interval: "1day",
            observations: prices.length,
            latestDate: prices[prices.length - 1].date,
            oldestDate: prices[0].date,
            prices,
            fetchedAt: Date.now(),
            cached: false,
        };

        historicalCache.set(symbol, {
            data: result,
            timestamp: Date.now(),
        });

        return result;
    } catch (error) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || error.message || "";

        if (
            status === 429 ||
            /rate.?limit|too many requests|credits/i.test(message)
        ) {
            rateLimitUntil = Date.now() + RATE_LIMIT_COOLDOWN;

            throw new Error(
                "Twelve Data rate limit reached. Please wait before trying again."
            );
        }

        if (status === 401 || status === 403) {
            throw new Error(
                "Market data API authentication failed. Check your Twelve Data API key."
            );
        }

        if (error.code === "ECONNABORTED") {
            throw new Error(
                "Historical market data request timed out. Please try again."
            );
        }

        throw new Error(
            message || "Failed to fetch historical market data."
        );
    }
};

module.exports = {
    getHistoricalPrices,
};
