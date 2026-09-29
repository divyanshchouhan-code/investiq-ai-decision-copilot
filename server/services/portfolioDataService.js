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
     * Promise.all allows the independent
     * price requests to run together.
     */

    const priceResults =
        await Promise.all(
            investments.map(
                (investment) =>
                    getCurrentPrice(
                        investment.symbol
                    )
            )
        );

    return investments.map(
        (investment, index) => {

            const currentPrice =
                priceResults[index].price;

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
            };
        }
    );
};


module.exports = {
    getInvestmentsWithCurrentValue,
};