const { getCurrentPrice } = require("../services/marketDataService");

const getPrice = async (req, res) => {
    try {
        const { symbol } = req.params;

        const result = await getCurrentPrice(symbol);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getPrice,
};