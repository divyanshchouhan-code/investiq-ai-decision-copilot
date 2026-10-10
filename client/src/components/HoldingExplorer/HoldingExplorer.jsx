import { useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronRight,
    Layers3,
    Minus,
    Trash2,
    Pencil,
    X,
    Save,
} from "lucide-react";
import "./HoldingExplorer.css";

const getActionForHolding = (symbol, actions) =>
    actions.find((action) => action.symbol === symbol);

const formatCurrency = (value) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return "Unavailable";
    }

    return `₹${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const HoldingExplorer = ({
    holdings = [],
    actions = [],
    onInvestmentChanged,
}) => {
    const [deletingId, setDeletingId] = useState(null);
    const [editingHolding, setEditingHolding] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [deleteSuccess, setDeleteSuccess] = useState("");
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");
    const [selectedPurchases, setSelectedPurchases] = useState({});

    const [formData, setFormData] = useState({
        quantity: "",
        buyPrice: "",
        purchaseDate: "",
        assetType: "Stock",
    });

    const handleDelete = async (holding) => {
        const investmentId = holding.id || holding._id;

        if (!investmentId) {
            setDeleteError("Investment ID is missing.");
            setDeleteSuccess("");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${holding.symbol} from your portfolio?`
        );

        if (!confirmed) return;

        setDeletingId(investmentId);
        setDeleteError("");
        setDeleteSuccess("");

        try {
            await api.delete(`/portfolio/${investmentId}`);

            setDeleteSuccess(
                `${holding.symbol} was removed from your portfolio.`
            );

            if (onInvestmentChanged) {
                await onInvestmentChanged();
            }
        } catch (error) {
            setDeleteError(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete investment."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const openEditForm = (holding) => {
        setEditingHolding(holding);
        setEditError("");
        setEditSuccess("");

        const dateValue = holding.purchaseDate
            ? new Date(holding.purchaseDate).toISOString().slice(0, 10)
            : "";

        setFormData({
            quantity: String(holding.quantity ?? ""),
            buyPrice: String(holding.buyPrice ?? ""),
            purchaseDate: dateValue,
            assetType: holding.assetType || "Stock",
        });
    };

    const closeEditForm = () => {
        if (saving) return;

        setEditingHolding(null);
        setEditError("");
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!editingHolding) return;

        const investmentId = editingHolding.id || editingHolding._id;
        const quantity = Number(formData.quantity);
        const buyPrice = Number(formData.buyPrice);

        if (!investmentId) {
            setEditError("Investment ID is missing.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            setEditError("Quantity must be greater than zero.");
            return;
        }

        if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
            setEditError("Buy price must be greater than zero.");
            return;
        }

        if (!formData.purchaseDate) {
            setEditError("Please select a purchase date.");
            return;
        }

        setSaving(true);
        setEditError("");
        setEditSuccess("");

        try {
            await api.put(`/portfolio/${investmentId}`, {
                quantity,
                buyPrice,
                purchaseDate: formData.purchaseDate,
                assetType: formData.assetType,
            });

            setEditSuccess(`${editingHolding.symbol} was updated successfully.`);
            setEditingHolding(null);

            if (onInvestmentChanged) {
                await onInvestmentChanged();
            }
        } catch (error) {
            setEditError(
                error.response?.data?.message ||
                error.message ||
                "Failed to update investment."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!holdings.length) {
        return (
            <motion.section
                className="holding-explorer glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="holding-empty">
                    <div className="holding-empty-icon">
                        <Layers3 size={24} />
                    </div>
                    <div>
                        <span className="holding-eyebrow">
                            HOLDING EXPLORER
                        </span>
                        <h2>Your holdings will appear here</h2>
                        <p>
                            Add investments to explore individual portfolio
                            positions.
                        </p>
                    </div>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section
            className="holding-explorer glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="holding-explorer-header">
                <div>
                    <span className="holding-eyebrow">
                        HOLDING EXPLORER
                    </span>
                    <h2>Understand every position.</h2>
                    <p>
                        Explore how each holding contributes to your portfolio.
                    </p>
                </div>

                <div className="holding-count">
                    {holdings.length}
                    <span>
                        {holdings.length === 1 ? " holding" : " holdings"}
                    </span>
                </div>
            </div>

            {deleteError && (
                <p className="holding-error" role="alert">
                    {deleteError}
                </p>
            )}

            {deleteSuccess && (
                <p className="holding-success" role="status">
                    {deleteSuccess}
                </p>
            )}

            {editSuccess && (
                <p className="holding-success" role="status">
                    {editSuccess}
                </p>
            )}

            <div className="holding-list">
                {holdings.map((holding, index) => {
                    const action = getActionForHolding(
                        holding.symbol,
                        actions
                    );

                    const hasMarketData =
                        holding.marketDataAvailable !== false &&
                        Number.isFinite(holding.currentValue) &&
                        Number.isFinite(holding.currentPrice);

                    const returnPercentage =
                        hasMarketData &&
                        Number.isFinite(holding.returnPercentage)
                            ? holding.returnPercentage
                            : null;

                    const isProfit =
                        returnPercentage !== null &&
                        returnPercentage >= 0;

                    const displayAction = hasMarketData ? action : null;

                    const ActionIcon =
                        displayAction?.signal === "REDUCE"
                            ? ArrowDownRight
                            : displayAction?.signal === "ADD"
                              ? ArrowUpRight
                              : Minus;

                    const purchases = holding.purchases || [];

                    const selectedPurchaseId = selectedPurchases[holding.id];

                    const selectedPurchase =
                        purchases.find(
                            (purchase) => purchase.id === selectedPurchaseId
                        ) || purchases[0] || null;

                    const investmentId = selectedPurchase?.id || null;
                    const isDeleting = deletingId === investmentId;

                    return (
                        <motion.article
                            key={investmentId || holding.symbol}
                            className="holding-card"
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <div className="holding-card-top">
                                <div className="holding-identity">
                                    <div className="holding-symbol-orb">
                                        {holding.symbol?.charAt(0)}
                                    </div>

                                    <div>
                                        <h3>{holding.symbol}</h3>
                                        <span>{holding.assetType}</span>
                                    </div>
                                </div>

                                {purchases.length > 1 && (
                                    <div className="holding-purchase-selector">
                                        <label htmlFor={`purchase-${holding.id}`}>
                                            Select purchase to edit or delete
                                        </label>

                                        <select
                                            id={`purchase-${holding.id}`}
                                            value={selectedPurchase?.id || ""}
                                            onChange={(event) =>
                                                setSelectedPurchases((previous) => ({
                                                    ...previous,
                                                    [holding.id]: event.target.value,
                                                }))
                                            }
                                        >
                                            {purchases.map((purchase) => (
                                                <option key={purchase.id} value={purchase.id}>
                                                    {`Qty: ${purchase.quantity} | Buy: ${formatCurrency(purchase.buyPrice)} | ${new Date(purchase.purchaseDate).toLocaleDateString("en-IN")}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="holding-card-actions">
                                    {displayAction && (
                                        <div
                                            className={`holding-action holding-action-${displayAction.signal.toLowerCase()}`}
                                        >
                                            <ActionIcon size={14} />
                                            <span>
                                                {displayAction.signal === "ADD"
                                                    ? "CONSIDER ADDING"
                                                    : displayAction.signal}
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="holding-edit-button"
                                        onClick={() => {
                                            if (selectedPurchase) {
                                                openEditForm({
                                                    ...selectedPurchase,
                                                    symbol: holding.symbol,
                                                });
                                            }
                                        }}
                                        disabled={!selectedPurchase || Boolean(deletingId) || saving}
                                    >
                                        <Pencil size={14} />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="holding-delete-button"
                                        onClick={() => {
                                            if (selectedPurchase) {
                                                handleDelete({
                                                    ...selectedPurchase,
                                                    symbol: holding.symbol,
                                                });
                                            }
                                        }}
                                        disabled={isDeleting || saving || !investmentId}
                                    >
                                        <Trash2 size={14} />
                                        <span>
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="holding-value-row">
                                <div>
                                    <span>CURRENT VALUE</span>
                                    <strong>
                                        {formatCurrency(holding.currentValue)}
                                    </strong>
                                </div>

                                {hasMarketData ? (
                                    <div
                                        className={
                                            isProfit
                                                ? "holding-return positive"
                                                : "holding-return negative"
                                        }
                                    >
                                        {isProfit ? (
                                            <ArrowUpRight size={15} />
                                        ) : (
                                            <ArrowDownRight size={15} />
                                        )}
                                        {isProfit ? "+" : ""}
                                        {returnPercentage.toFixed(2)}%
                                    </div>
                                ) : (
                                    <div className="holding-return">
                                        Market data unavailable
                                    </div>
                                )}
                            </div>

                            <div className="holding-metrics">
                                <div>
                                    <span>QUANTITY</span>
                                    <strong>{holding.quantity}</strong>
                                </div>

                                <div>
                                    <span>BUY PRICE</span>
                                    <strong>{formatCurrency(holding.buyPrice)}</strong>
                                </div>

                                <div>
                                    <span>CURRENT PRICE</span>
                                    <strong>{formatCurrency(holding.currentPrice)}</strong>
                                </div>

                                <div>
                                    <span>INVESTED</span>
                                    <strong>{formatCurrency(holding.investedValue)}</strong>
                                </div>
                            </div>

                            {!hasMarketData ? (
                                <div className="holding-intelligence">
                                    <div className="holding-intelligence-header">
                                        <span>MARKET DATA STATUS</span>
                                        <ChevronRight size={15} />
                                    </div>
                                    <p>
                                        {holding.marketDataError ||
                                            "Current market data is unavailable for this holding. Action signals are hidden until valid price data is available."}
                                    </p>
                                </div>
                            ) : displayAction ? (
                                <div className="holding-intelligence">
                                    <div className="holding-intelligence-header">
                                        <span>INTELLIGENCE</span>
                                        <ChevronRight size={15} />
                                    </div>
                                    <p>{displayAction.reason}</p>
                                </div>
                            ) : null}
                        </motion.article>
                    );
                })}
            </div>

            {editingHolding && (
                <div className="holding-edit-overlay">
                    <motion.div
                        className="holding-edit-modal"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="holding-edit-title"
                    >
                        <div className="holding-edit-header">
                            <div>
                                <span className="holding-eyebrow">
                                    UPDATE POSITION
                                </span>
                                <h2 id="holding-edit-title">
                                    Edit {editingHolding.symbol}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="holding-edit-close"
                                onClick={closeEditForm}
                                disabled={saving}
                                aria-label="Close edit form"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <label>
                                Quantity
                                <input
                                    type="number"
                                    name="quantity"
                                    min="0.000001"
                                    step="any"
                                    value={formData.quantity}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>

                            <label>
                                Buy Price (₹)
                                <input
                                    type="number"
                                    name="buyPrice"
                                    min="0.01"
                                    step="any"
                                    value={formData.buyPrice}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>

                            <label>
                                Purchase Date
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    value={formData.purchaseDate}
                                    onChange={handleFormChange}
                                    max={new Date().toISOString().slice(0, 10)}
                                    required
                                />
                            </label>

                            <label>
                                Asset Type
                                <select
                                    name="assetType"
                                    value={formData.assetType}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="Stock">Stock</option>
                                    <option value="ETF">ETF</option>
                                    <option value="Mutual Fund">Mutual Fund</option>
                                    <option value="Crypto">Crypto</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>

                            {editError && (
                                <p className="holding-error" role="alert">
                                    {editError}
                                </p>
                            )}

                            <div className="holding-edit-actions">
                                <button
                                    type="button"
                                    className="holding-edit-cancel"
                                    onClick={closeEditForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="holding-edit-save"
                                    disabled={saving}
                                >
                                    <Save size={15} />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.section>
    );
};

export default HoldingExplorer;