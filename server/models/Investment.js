const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        symbol: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0.000001,
        },

        buyPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        purchaseDate: {
            type: Date,
            required: true,
        },

        assetType: {
            type: String,
            enum: ["stock", "etf", "mutual_fund", "crypto"],
            default: "stock",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Investment", investmentSchema);