const axios = require("axios");

const priceCache = new Map();
const pendingRequests = new Map();

const CACHE_DURATION = 5 * 60 * 1000;
const RATE_LIMIT_COOLDOWN = 15 * 1000;

let rateLimitUntil = 0;

const getCurrentPrice = async (symbol) => {
    if (typeof symbol !== "string" || !symbol.trim()) {
        throw new Error("Symbol is required.");
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const cached = priceCache.get(normalizedSymbol);

    if (cached) {
        const cacheAge = Date.now() - cached.timestamp;

        if (cacheAge < CACHE_DURATION) {
            return {
                success: true,
                symbol: normalizedSymbol,
                price: cached.price,
                cached: true,
                timestamp: cached.timestamp,
            };
        }

        priceCache.delete(normalizedSymbol);
    }

    if (Date.now() < rateLimitUntil) {
        throw new Error(
            "Market data is temporarily rate limited. Please try again in a few seconds."
        );
    }

    if (pendingRequests.has(normalizedSymbol)) {
        return pendingRequests.get(normalizedSymbol);
    }

    const requestPromise = fetchPriceFromTwelveData(normalizedSymbol);

    pendingRequests.set(normalizedSymbol, requestPromise);

    try {
        return await requestPromise;
    } finally {
        pendingRequests.delete(normalizedSymbol);
    }
};

const fetchPriceFromTwelveData = async (symbol) => {
    try {
        const apiKey = process.env.TWELVE_DATA_API_KEY;

        if (!apiKey) {
            throw new Error("Market data API key is not configured.");
        }

        const response = await axios.get(
            "https://api.twelvedata.com/price",
            {
                params: {
                    symbol,
                    apikey: apiKey,
                },
                timeout: 10000,
            }
        );

        const data = response.data;

        if (
            data?.status === "error" ||
            data?.code === 429 ||
            data?.code === "429" ||
            /rate.?limit|too many requests/i.test(data?.message || "")
        ) {
            if (
                data?.code === 429 ||
                data?.code === "429" ||
                /rate.?limit|too many requests/i.test(data?.message || "")
            ) {
                rateLimitUntil = Date.now() + RATE_LIMIT_COOLDOWN;

                throw new Error(
                    "Twelve Data rate limit reached. Please wait a few seconds and try again."
                );
            }

            throw new Error(
                data?.message || "Failed to fetch market price."
            );
        }

        const price = Number(data?.price);

        if (!Number.isFinite(price) || price <= 0) {
            throw new Error(
                "A valid positive market price is not available for this symbol."
            );
        }

        const timestamp = Date.now();

        priceCache.set(symbol, {
            price,
            timestamp,
        });

        return {
            success: true,
            symbol,
            price,
            cached: false,
            timestamp,
        };
    } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || "";

        if (
            status === 429 ||
            /rate.?limit|too many requests/i.test(message)
        ) {
            rateLimitUntil = Date.now() + RATE_LIMIT_COOLDOWN;

            throw new Error(
                "Twelve Data rate limit reached. Please wait a few seconds and try again."
            );
        }

        if (status === 401 || status === 403) {
            throw new Error(
                "Market data API authentication failed. Check your Twelve Data API key."
            );
        }

        if (error.code === "ECONNABORTED") {
            throw new Error(
                "Market data request timed out. Please try again."
            );
        }

        throw new Error(
            message || "Failed to fetch current market price."
        );
    }
};

module.exports = {
    getCurrentPrice,
};