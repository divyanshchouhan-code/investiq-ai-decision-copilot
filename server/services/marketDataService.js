const axios = require("axios");

const priceCache = new Map();

const CACHE_DURATION = 60 * 1000;

const getCurrentPrice = async (symbol) => {
    if (!symbol) {
        throw new Error("Symbol is required.");
    }

    const normalizedSymbol =
        symbol.toUpperCase();

    /*
     * Check cache first
     */

    const cached =
        priceCache.get(normalizedSymbol);

    if (cached) {
        const cacheAge =
            Date.now() - cached.timestamp;

        if (cacheAge < CACHE_DURATION) {
            return {
                success: true,
                symbol: normalizedSymbol,
                price: cached.price,
                cached: true,
            };
        }

        /*
         * Cache expired
         */

        priceCache.delete(
            normalizedSymbol
        );
    }

    /*
     * No valid cached price.
     * Fetch from Twelve Data.
     */

    try {
        const response = await axios.get(
            "https://api.twelvedata.com/price",
            {
                params: {
                    symbol: normalizedSymbol,
                    apikey:
                        process.env
                            .TWELVE_DATA_API_KEY,
                },
            }
        );

        if (response.data.status === "error") {
            throw new Error(
                response.data.message ||
                "Failed to fetch market price."
            );
        }

        if (!response.data.price) {
            throw new Error(
                "Price not available."
            );
        }

        const price =
            Number(response.data.price);

        /*
         * Store price in cache
         */

        priceCache.set(
            normalizedSymbol,
            {
                price,
                timestamp: Date.now(),
            }
        );

        return {
            success: true,
            symbol: normalizedSymbol,
            price,
            cached: false,
        };

    } catch (error) {

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch current price."
        );
    }
};

module.exports = {
    getCurrentPrice,
};