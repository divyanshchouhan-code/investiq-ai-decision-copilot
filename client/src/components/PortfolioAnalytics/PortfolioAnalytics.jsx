import { useMemo } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import "./PortfolioAnalytics.css";

const COLORS = [
    "#8b9dff",
    "#b69cff",
    "#63d9c0",
    "#ffbd75",
    "#ff7e9f",
    "#66b3ff",
    "#d8e178",
    "#c6a0ff",
];

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;

const PortfolioAnalytics = ({ holdings = [] }) => {
    const analytics = useMemo(() => {
        const allocation = holdings.map((holding) => ({
            name: holding.symbol,
            value: Number(holding.currentValue) || 0,
        })).filter((item) => item.value > 0);

        const comparison = holdings.map((holding) => ({
            symbol: holding.symbol,
            invested: Number(holding.investedValue) || 0,
            current: Number(holding.currentValue) || 0,
        }));

        const returns = holdings.map((holding) => {
            const invested = Number(holding.investedValue) || 0;
            const current = Number(holding.currentValue) || 0;

            return {
                symbol: holding.symbol,
                returnPercentage:
                    invested > 0
                        ? ((current - invested) / invested) * 100
                        : 0,
                marketDataAvailable:
                    holding.marketDataAvailable !== false &&
                    Number.isFinite(holding.currentValue) &&
                    Number.isFinite(holding.currentPrice),
            };
        });

        return { allocation, comparison, returns };
    }, [holdings]);

    if (!holdings.length) {
        return (
            <section className="portfolio-analytics glass">
                <div className="analytics-heading">
                    <span>PORTFOLIO ANALYTICS</span>
                    <h2>Understand your investments.</h2>
                    <p>Add investments to see your portfolio analytics.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="portfolio-analytics glass">
            <div className="analytics-heading">
                <span>PORTFOLIO ANALYTICS</span>
                <h2>See the bigger picture.</h2>
                <p>
                    Explore allocation, invested capital, and holding returns.
                </p>
            </div>

            <div className="analytics-grid">
                <article className="analytics-card">
                    <div className="analytics-card-heading">
                        <h3>Portfolio Allocation</h3>
                        <span>BY HOLDING</span>
                    </div>

                    {analytics.allocation.length ? (
                        <div className="analytics-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.allocation}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius="58%"
                                        outerRadius="82%"
                                        paddingAngle={3}
                                    >
                                        {analytics.allocation.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            background: "#151a30",
                                            border: "1px solid #303752",
                                            borderRadius: "10px",
                                            color: "#ffffff",
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="analytics-empty">
                            Current market values are unavailable.
                        </p>
                    )}
                </article>

                <article className="analytics-card">
                    <div className="analytics-card-heading">
                        <h3>Invested vs. Current</h3>
                        <span>VALUE IN ₹</span>
                    </div>

                    <div className="analytics-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analytics.comparison}
                                margin={{
                                    top: 12,
                                    right: 8,
                                    left: 8,
                                    bottom: 8,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#292f48"
                                />
                                <XAxis
                                    dataKey="symbol"
                                    tick={{ fill: "#aeb6d1", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#aeb6d1", fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) =>
                                        value >= 1000
                                            ? `${(value / 1000).toFixed(0)}k`
                                            : value
                                    }
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        background: "#151a30",
                                        border: "1px solid #303752",
                                        borderRadius: "10px",
                                        color: "#ffffff",
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="invested"
                                    name="Invested"
                                    fill="#8b9dff"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="current"
                                    name="Current value"
                                    fill="#63d9c0"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                <article className="analytics-card analytics-card-wide">
                    <div className="analytics-card-heading">
                        <h3>Returns by Holding</h3>
                        <span>RETURN %</span>
                    </div>

                    <div className="analytics-chart analytics-returns-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analytics.returns}
                                margin={{
                                    top: 12,
                                    right: 12,
                                    left: 8,
                                    bottom: 8,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#292f48"
                                />
                                <XAxis
                                    dataKey="symbol"
                                    tick={{ fill: "#aeb6d1", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#aeb6d1", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    formatter={(value, name, item) => [
                                        item.payload.marketDataAvailable
                                            ? `${Number(value).toFixed(2)}%`
                                            : "Market data unavailable",
                                        "Return",
                                    ]}
                                    contentStyle={{
                                        background: "#151a30",
                                        border: "1px solid #303752",
                                        borderRadius: "10px",
                                        color: "#ffffff",
                                    }}
                                />
                                <Bar
                                    dataKey="returnPercentage"
                                    name="Return"
                                    fill="#8b9dff"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <p className="analytics-disclaimer">
                        Returns are calculated from invested value and current
                        value. Missing market data can make these figures
                        incomplete.
                    </p>
                </article>
            </div>
        </section>
    );
};

export default PortfolioAnalytics;