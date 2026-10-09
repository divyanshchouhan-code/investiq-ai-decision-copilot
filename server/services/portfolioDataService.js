const Investment = require("../models/Investment");

const {
    getCurrentPrice,
} = require("./marketDataService");


const getInvestmentsWithCurrentValue = async (
    userId
) => {

    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }

    const investments =
        await Investment.find({
            userId,
        });

    if (investments.length === 0) {
        return [];
    }

    /*
     * Fetch market prices for all holdings.
     *
     * Promise.allSettled allows us to continue
     * even if one market price request fails.
     */

    const priceResults =
        await Promise.allSettled(
            investments.map(
                (investment) =>
                    getCurrentPrice(
                        investment.symbol
                    )
            )
        );

    return investments.map(
        (investment, index) => {

            const priceResult =
                priceResults[index];

            /*
             * If market data is unavailable
             * for this symbol, don't crash
             * the entire portfolio.
             */

            if (
                priceResult.status ===
                "rejected"
            ) {
                return {
                    id: investment._id,

                    symbol:
                        investment.symbol,

                    assetType:
                        investment.assetType,

                    quantity:
                        investment.quantity,

                    buyPrice:
                        investment.buyPrice,

                    currentPrice:
                        null,

                    investedValue:
                        Number(
                            (
                                investment.quantity *
                                investment.buyPrice
                            ).toFixed(2)
                        ),

                    currentValue:
                        null,

                    marketDataAvailable:
                        false,

                    marketDataError:
                        priceResult.reason
                            ?.message ||
                        "Market data unavailable.",
                };
            }

            /*
             * Market price successfully
             * fetched.
             */

            const currentPrice =
                priceResult.value.price;

            const investedValue =
                investment.quantity *
                investment.buyPrice;

            const currentValue =
                investment.quantity *
                currentPrice;

            return {
                id: investment._id,

                symbol:
                    investment.symbol,

                assetType:
                    investment.assetType,

                quantity:
                    investment.quantity,

                buyPrice:
                    investment.buyPrice,

                currentPrice:
                    Number(
                        currentPrice.toFixed(2)
                    ),

                investedValue:
                    Number(
                        investedValue.toFixed(2)
                    ),

                currentValue:
                    Number(
                        currentValue.toFixed(2)
                    ),

                marketDataAvailable:
                    true,

                marketDataError:
                    null,
            };
        }
    );
};


module.exports = {
    getInvestmentsWithCurrentValue,
};