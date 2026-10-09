import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Plus, X, WalletCards } from "lucide-react";
import api from "../../api/axios";

import "./AddInvestment.css";

// Basic local lookup for commonly used US stock tickers.
// This is a starter lookup, not a complete market symbol database.
const COMPANY_SYMBOLS = {
    microsoft: "MSFT",
    apple: "AAPL",
    google: "GOOGL",
    alphabet: "GOOGL",
    amazon: "AMZN",
    nvidia: "NVDA",
    tesla: "TSLA",
    meta: "META",
    facebook: "META",
    netflix: "NFLX",
    amd: "AMD",
    intel: "INTC",
    "berkshire hathaway": "BRK.B",
    walmart: "WMT",
    disney: "DIS",
    paypal: "PYPL",
    uber: "UBER",
    adobe: "ADBE",
    salesforce: "CRM",
    cisco: "CSCO",
};

const normalizeInput = (value) => value.trim().toLowerCase();

const resolveSymbol = (value) => {
    const normalized = normalizeInput(value);

    // Convert a recognized company name to its ticker.
    if (COMPANY_SYMBOLS[normalized]) {
        return COMPANY_SYMBOLS[normalized];
    }

    // Otherwise assume the user entered a ticker.
    return value.trim().toUpperCase();
};

const AddInvestment = ({ onInvestmentAdded }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        symbol: "",
        quantity: "",
        buyPrice: "",
        purchaseDate: "",
        assetType: "stock",
    });

    const handleSelectTicker = () => {
        setFormData((prev) => ({
            ...prev,
            symbol: resolveSymbol(prev.symbol),
        }));
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const resolvedSymbol = resolveSymbol(formData.symbol);
    const normalizedInput = normalizeInput(formData.symbol);
    const isCompanyName = Boolean(COMPANY_SYMBOLS[normalizedInput]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        try {
            const symbol = resolveSymbol(formData.symbol);

            if (!symbol) {
                throw new Error("Please enter a company name or ticker.");
            }

            const quantity = Number(formData.quantity);
            const buyPrice = Number(formData.buyPrice);

            if (!Number.isFinite(quantity) || quantity <= 0) {
                throw new Error("Quantity must be greater than zero.");
            }

            if (!Number.isFinite(buyPrice) || buyPrice < 0) {
                throw new Error("Buy price cannot be negative.");
            }

            setLoading(true);

            await api.post("/portfolio", {
                symbol,
                quantity,
                buyPrice,
                purchaseDate: formData.purchaseDate,
                assetType: formData.assetType,
            });

            setSuccess(`Investment added successfully (${symbol}).`);

            setFormData({
                symbol: "",
                quantity: "",
                buyPrice: "",
                purchaseDate: "",
                assetType: "stock",
            });

            if (onInvestmentAdded) {
                onInvestmentAdded();
            }

            setTimeout(() => {
                setIsOpen(false);
                setSuccess("");
            }, 1000);
        } catch (error) {
            console.error("Add investment error:", error);

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to add investment."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <motion.button
                type="button"
                className="add-investment-button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                    setIsOpen(true);
                    setError("");
                    setSuccess("");
                }}
            >
                <Plus size={18} />
                Add Investment
            </motion.button>

            {isOpen &&
                createPortal(
                    <div className="investment-modal-backdrop">
                        <motion.div
                            className="investment-modal glass"
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="investment-modal-header">
                                <div className="investment-modal-title">
                                    <div className="investment-modal-icon">
                                        <WalletCards size={20} />
                                    </div>

                                    <div>
                                        <span>PORTFOLIO</span>
                                        <h2>Add Investment</h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="investment-close"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="investment-modal-description">
                                Add an existing investment to your InvestIQ
                                portfolio.
                            </p>

                            <form
                                className="investment-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="investment-form-group">
                                    <label htmlFor="investment-symbol">
                                        COMPANY NAME OR TICKER
                                    </label>

                                    <input
                                        id="investment-symbol"
                                        type="text"
                                        name="symbol"
                                        value={formData.symbol}
                                        onChange={handleChange}
                                        placeholder="e.g. Microsoft or MSFT"
                                        autoComplete="off"
                                        required
                                    />

                                    <small>
                                        {COMPANY_SYMBOLS[formData.symbol.trim().toLowerCase()] && (
                                        <button
                                            type="button"
                                            onClick={handleSelectTicker}
                                            className="recognized-ticker"
                                        >
                                            Recognized ticker:{" "}
                                            {resolveSymbol(formData.symbol)}
                                            <span> · Click to use ticker</span>
                                        </button>
                                        )}
                                    </small>
                                </div>

                                <div className="investment-form-row">
                                    <div className="investment-form-group">
                                        <label htmlFor="investment-quantity">
                                            QUANTITY
                                        </label>

                                        <input
                                            id="investment-quantity"
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            placeholder="10"
                                            min="0.000001"
                                            step="any"
                                            required
                                        />
                                    </div>

                                    <div className="investment-form-group">
                                        <label htmlFor="investment-buy-price">
                                            BUY PRICE
                                        </label>

                                        <input
                                            id="investment-buy-price"
                                            type="number"
                                            name="buyPrice"
                                            value={formData.buyPrice}
                                            onChange={handleChange}
                                            placeholder="250"
                                            min="0"
                                            step="any"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="investment-form-row">
                                    <div className="investment-form-group">
                                        <label htmlFor="investment-date">
                                            PURCHASE DATE
                                        </label>

                                        <input
                                            id="investment-date"
                                            type="date"
                                            name="purchaseDate"
                                            value={formData.purchaseDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="investment-form-group">
                                        <label htmlFor="investment-asset-type">
                                            ASSET TYPE
                                        </label>

                                        <select
                                            id="investment-asset-type"
                                            name="assetType"
                                            value={formData.assetType}
                                            onChange={handleChange}
                                        >
                                            <option value="stock">
                                                Stock
                                            </option>
                                            <option value="etf">
                                                ETF
                                            </option>
                                            <option value="mutual_fund">
                                                Mutual Fund
                                            </option>
                                            <option value="crypto">
                                                Crypto
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <div className="investment-message error">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="investment-message success">
                                        {success}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="investment-submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Adding..."
                                        : "Add to Portfolio"}
                                </button>
                            </form>
                        </motion.div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default AddInvestment;