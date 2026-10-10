
const Investment = require("../models/Investment");
const { getCurrentPrice } = require("./marketDataService");

const getInvestmentsWithCurrentValue = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const investments = await Investment.find({ userId });

    if (investments.length === 0) {
        return [];
    }

    const groups = new Map();

    for (const investment of investments) {
        const symbol = investment.symbol.trim().toUpperCase();
        const assetType = investment.assetType;
        const key = `${symbol}:${assetType}`;

        if (!groups.has(key)) {
            groups.set(key, {
                symbol,
                assetType,
                quantity: 0,
                investedValue: 0,
                buyCurrency: "INR",
                purchaseIds: [],
                purchases: [],
                purchaseCount: 0,
            });
        }

        const group = groups.get(key);

        group.quantity += investment.quantity;
        group.investedValue += investment.quantity * investment.buyPrice;
        group.purchaseIds.push(investment._id.toString());

        group.purchases.push({
            id: investment._id.toString(),
            quantity: investment.quantity,
            buyPrice: investment.buyPrice,
            purchaseDate: investment.purchaseDate,
            assetType: investment.assetType,
        });

        group.purchaseCount += 1;
    }

    const positions = Array.from(groups.values());

    const priceResults = await Promise.allSettled(
        positions.map((position) => getCurrentPrice(position.symbol))
    );

    return positions.map((position, index) => {
        const priceResult = priceResults[index];

        const averageBuyPrice =
            position.quantity > 0
                ? position.investedValue / position.quantity
                : 0;

        if (priceResult.status === "rejected") {
            return {
                ...position,
                id: position.symbol + ":" + position.assetType,
                buyPrice: Number(averageBuyPrice.toFixed(2)),
                investedValue: Number(position.investedValue.toFixed(2)),
                currentPrice: null,
                currentValue: null,
                profitLoss: null,
                returnPercentage: null,
                marketDataAvailable: false,
                marketDataError:
                    priceResult.reason?.message || "Market data unavailable.",
            };
        }

        const currentPrice = Number(priceResult.value.price);
        const currentValue = position.quantity * currentPrice;
        const profitLoss = currentValue - position.investedValue;

        return {
            ...position,
            id: position.symbol + ":" + position.assetType,
            buyPrice: Number(averageBuyPrice.toFixed(2)),
            investedValue: Number(position.investedValue.toFixed(2)),
            currentPrice: Number(currentPrice.toFixed(2)),
            currentValue: Number(currentValue.toFixed(2)),
            profitLoss: Number(profitLoss.toFixed(2)),
            returnPercentage:
                position.investedValue > 0
                    ? Number(
                          ((profitLoss / position.investedValue) * 100).toFixed(2)
                      )
                    : 0,
            marketDataAvailable: true,
            marketDataError: null,
        };
    });
};

module.exports = {
    getInvestmentsWithCurrentValue,
};
