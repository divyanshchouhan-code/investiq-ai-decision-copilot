import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import {
    ArrowUpRight,
    BrainCircuit,
    Layers3,
    ShieldAlert,
    Sparkles,
    WalletCards,
} from "lucide-react";

import AICopilot from "../../components/AICopilot/AICopilot";
import ActionIntelligence from "../../components/ActionIntelligence/ActionIntelligence";
import HoldingExplorer from "../../components/HoldingExplorer/HoldingExplorer";
import AddInvestment from "../../components/AddInvestment/AddInvestment";
import api from "../../api/axios";
import PortfolioAnalytics from "../../components/PortfolioAnalytics/PortfolioAnalytics";

import "./InvestmentSpace.css";

const InvestmentSpace = () => {
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [risk, setRisk] = useState(null);
    const [insights, setInsights] = useState([]);
    const [actions, setActions] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const fetchInvestmentSpaceData = async () => {
        try {
            setError("");

            const results = await Promise.allSettled([
                api.get("/portfolio/investment-space"),
                api.get("/ai/portfolio-analysis"),
            ]);

            const portfolioResult = results[0];
            const aiResult = results[1];

            const hasUnauthorizedResponse = results.some(
                (result) =>
                    result.status === "rejected" &&
                    result.reason?.response?.status === 401
            );

            if (hasUnauthorizedResponse) {
                localStorage.removeItem("investiq_token");
                localStorage.removeItem("investiq_user");
                navigate("/login", { replace: true });
                return;
            }

            if (portfolioResult.status === "rejected") {
                throw new Error(
                    portfolioResult.reason?.response?.data?.message ||
                    portfolioResult.reason?.message ||
                    "Failed to load portfolio data."
                );
            }

            const investmentSpaceData = portfolioResult.value.data;

            setSummary(investmentSpaceData.summary || null);
            setAnalytics(investmentSpaceData.analytics || null);
            setRisk(investmentSpaceData.risk || null);
            setInsights(investmentSpaceData.insights || []);
            setActions(investmentSpaceData.actions || []);
            setHoldings(investmentSpaceData.holdings || []);

            if (aiResult.status === "fulfilled") {
                setAiAnalysis(aiResult.value.data?.analysis || null);
            } else {
                console.error(
                    "AI analysis unavailable:",
                    aiResult.reason?.response?.data ||
                    aiResult.reason?.message
                );

                setAiAnalysis(null);
            }
        } catch (error) {
            console.error("Investment Space error:", error);

            setError(
                error.response?.data?.message ||
                error.message ||
                "Something went wrong while loading your portfolio."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestmentSpaceData();
    }, []);


    const handleSignOut = () => {
        localStorage.removeItem("investiq_token");
        localStorage.removeItem("investiq_user");

        navigate("/", { replace: true });
    };

    if (loading) {
        return (
            <div className="investment-space loading-state">
                <div className="loading-orb">
                    <Sparkles size={28} />
                </div>

                <p>Connecting to your investment universe...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="investment-space error-state">
                <div className="error-orb">
                    <ShieldAlert size={28} />
                </div>

                <h2>Investment Space unavailable</h2>

                <p>{error}</p>
            </div>
        );
    }

    /*
     * Portfolio summary
     */

    const totalInvested = summary?.totalInvested || 0;
    const currentValue = summary?.currentValue || 0;
    const totalPnL = summary?.totalPnL || 0;
    const returnPercentage = summary?.returnPercentage || 0;
    const numberOfHoldings = summary?.numberOfHoldings || 0;
    const isProfit = totalPnL >= 0;

    /*
     * Analytics
     */

    const concentration = analytics?.concentration || 0;
    const numberOfAssetTypes = analytics?.numberOfAssetTypes || 0;
    const largestHolding = analytics?.largestHolding;

    /*
     * Risk
     */

    const riskScore = risk?.score || 0;
    const riskLevel = risk?.level || "Unknown";
    const riskReasons = risk?.reasons || [];

    const riskPreference = risk?.preference?.selected || "Not set";

    const riskComparison =
        risk?.preference?.comparison?.status || "";

    /*
     * AI analysis
     */

    const aiSummary =
        aiAnalysis?.summary ||
        "AI analysis is currently unavailable. Your portfolio data is still displayed.";

    const aiSuggestions = aiAnalysis?.suggestions || [];

    console.log("HOLDINGS:", holdings);

    return (
        <main className="investment-space">
            {/* Background atmosphere */}

            <div className="space-orb space-orb-pink" />
            <div className="space-orb space-orb-blue" />
            <div className="space-orb space-orb-purple" />
            <div className="space-grid" />

            {/* Navigation */}

            <nav className="space-nav">
                <div className="space-logo">
                    <div className="logo-mark">
                        <Sparkles size={16} />
                    </div>

                    <span>
                        Invest<span>IQ</span>
                    </span>
                </div>

                <div className="space-nav-center">
                    <span className="active">Investment Space</span>
                    <div className="ai-status">
                        <span className="status-dot" />
                        AI Intelligence Active
                    </div>
                </div>

                <div className="space-nav-actions">
                    <AddInvestment
                        onInvestmentAdded={() => {
                            window.location.reload();
                        }}
                    />

                    <button
                        type="button"
                        className="signout-button"
                        onClick={handleSignOut}
                    >
                        <LogOut size={17} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>


            {/* Main content */}

            <section className="space-content">
                {/* Heading */}

                <motion.div
                    className="space-heading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="eyebrow">YOUR FINANCIAL UNIVERSE</p>

                    <h1>
                        Investment <span>Space</span>
                    </h1>

                    <p>
                        Your portfolio, risk and intelligence
                        in one living space.
                    </p>
                </motion.div>

                {/* Investment universe */}

                <div className="investment-universe">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />

                    {/* Portfolio core */}

                    <motion.section
                        className="portfolio-core glass"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                    >
                        <div className="core-glow" />

                        <div className="core-top">
                            <div>
                                <span className="label">
                                    PORTFOLIO VALUE
                                </span>

                                <h2>
                                    ₹
                                    {currentValue.toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </h2>
                            </div>

                            <div className="value-icon">
                                <WalletCards size={22} />
                            </div>
                        </div>

                        <div className="core-return">
                            <div
                                className={
                                    isProfit
                                        ? "return-positive"
                                        : "return-negative"
                                }
                            >
                                <ArrowUpRight size={18} />
                                {returnPercentage.toFixed(2)}%
                            </div>

                            <span>overall return</span>
                        </div>

                        <div className="core-line" />

                        <div className="core-stats">
                            <div>
                                <span>INVESTED</span>

                                <strong>
                                    ₹
                                    {totalInvested.toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </strong>
                            </div>

                            <div>
                                <span>P&amp;L</span>

                                <strong
                                    className={isProfit ? "profit" : "loss"}
                                >
                                    {isProfit ? "+" : "-"}₹
                                    {Math.abs(totalPnL).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>HOLDINGS</span>
                                <strong>{numberOfHoldings}</strong>
                            </div>
                        </div>
                    </motion.section>

                    {/* Risk pulse */}

                    <motion.div
                        className="risk-pulse glass"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                    >
                        <div className="pulse-header">
                            <div className="pulse-icon">
                                <ShieldAlert size={20} />
                            </div>

                            <div>
                                <span>RISK PULSE</span>
                                <strong>{riskLevel}</strong>
                            </div>
                        </div>

                        <div className="risk-score">
                            <div className="score-number">{riskScore}</div>
                            <span>/ 100</span>
                        </div>

                        <div className="risk-meter">
                            <div
                                className="risk-meter-fill"
                                style={{
                                    width: `${riskScore}%`,
                                }}
                            />
                        </div>

                        <div className="risk-details">
                            <div>
                                <span>CONCENTRATION</span>
                                <strong>{concentration}%</strong>
                            </div>

                            <div>
                                <span>ASSET TYPES</span>
                                <strong>{numberOfAssetTypes}</strong>
                            </div>
                        </div>

                        <p className="risk-preference">
                            Preference: <strong>{riskPreference}</strong>
                            <br />
                            <span>{riskComparison}</span>
                        </p>
                    </motion.div>

                    {/* Largest holding */}

                    <motion.div
                        className="holding-node glass"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                    >
                        <div className="holding-node-icon">
                            <Layers3 size={19} />
                        </div>

                        <div>
                            <span>LARGEST HOLDING</span>

                            <strong>{largestHolding?.symbol || "—"}</strong>

                            <small>{concentration}% of portfolio</small>
                        </div>
                    </motion.div>
                </div>

                {/* Risk intelligence */}

                <motion.section
                    className="risk-intelligence glass"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                >
                    <div className="intelligence-title">
                        <div className="command-icon">
                            <BrainCircuit size={20} />
                        </div>

                        <div>
                            <span>RISK INTELLIGENCE</span>

                            <p>What is shaping your portfolio risk?</p>
                        </div>
                    </div>

                    <div className="risk-reasons">
                        {riskReasons.length > 0 ? (
                            riskReasons.map((reason, index) => (
                                <div className="reason" key={index}>
                                    <span className="reason-dot" />
                                    <p>{reason}</p>
                                </div>
                            ))
                        ) : (
                            <div className="reason">
                                <span className="reason-dot" />
                                <p>No major risk signals detected.</p>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* AI intelligence */}

                <motion.section
                    className="ai-intelligence glass"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.7 }}
                >
                    <div className="ai-intelligence-header">
                        <div className="ai-core-symbol">
                            <Sparkles size={22} />
                        </div>

                        <div>
                            <span>INVESTIQ AI CORE</span>
                            <h2>Portfolio Intelligence</h2>
                        </div>

                        <div className="ai-live">
                            <span />
                            LIVE
                        </div>
                    </div>

                    {/* AI summary */}

                    <div className="ai-summary">
                        <p className="ai-label">AI INTERPRETATION</p>
                        <p className="ai-summary-text">{aiSummary}</p>
                    </div>

                    {/* Backend intelligence feed */}

                    <div className="intelligence-feed">
                        <div className="feed-heading">
                            <span>INTELLIGENCE SIGNALS</span>
                            <small>
                                {insights.length} signals detected
                            </small>
                        </div>

                        <div className="feed-list">
                            {insights.map((insight, index) => (
                                <motion.div
                                    className="feed-item"
                                    key={index}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: 0.8 + index * 0.08,
                                    }}
                                >
                                    <div className="feed-dot" />
                                    <p>{insight}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* AI suggestions */}

                    {aiSuggestions.length > 0 && (
                        <div className="ai-suggestions">
                            <p className="ai-label">
                                EDUCATIONAL CONSIDERATIONS
                            </p>

                            <div className="suggestion-list">
                                {aiSuggestions.map((suggestion, index) => (
                                    <div
                                        className="suggestion"
                                        key={index}
                                    >
                                        <BrainCircuit size={15} />
                                        <p>{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.section>

                <PortfolioAnalytics holdings={holdings} />

                {/* Holdings and action intelligence */}

                <HoldingExplorer
                    holdings={holdings}
                    actions={actions}
                    onInvestmentChanged={fetchInvestmentSpaceData}
                />

                <ActionIntelligence actions={actions} />

                <AICopilot />
            </section>
        </main>
    );
};

export default InvestmentSpace;