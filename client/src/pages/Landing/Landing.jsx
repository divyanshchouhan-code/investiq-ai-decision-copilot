import { motion } from "framer-motion";
import {
    ArrowRight,
    Sparkles,
    Activity,
    ShieldCheck,
} from "lucide-react";

import "./Landing.css";

const Landing = () => {
    return (
        <main className="landing">

            {/* Background liquid elements */}
            <div className="landing-orb landing-orb-pink" />
            <div className="landing-orb landing-orb-blue" />
            <div className="landing-orb landing-orb-purple" />

            {/* Grid */}
            <div className="landing-grid" />

            {/* Navigation */}
            <nav className="landing-nav">

                <div className="brand">
                    <div className="brand-mark">
                        IQ
                    </div>

                    <span>InvestIQ</span>
                </div>

                <div className="nav-status">
                    <span className="status-dot" />
                    AI intelligence active
                </div>

                <button className="nav-login">
                    Sign in
                </button>

            </nav>


            {/* Main experience */}
            <section className="hero">

                {/* Left content */}
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >

                    <div className="hero-eyebrow">
                        <Sparkles size={15} />
                        <span>INTELLIGENT INVESTING</span>
                    </div>

                    <h1>
                        See your money
                        <br />
                        <span className="neon-text">
                            differently.
                        </span>
                    </h1>

                    <p className="hero-description">
                        InvestIQ turns your portfolio into an
                        intelligent investment space — combining
                        real-time data, risk intelligence and AI-powered
                        insights.
                    </p>

                    <div className="hero-actions">

                        <button className="hero-button">
                            Enter your investment space
                            <ArrowRight size={18} />
                        </button>

                        <button className="explore-button">
                            Explore intelligence
                        </button>

                    </div>

                    <div className="hero-trust">

                        <div>
                            <ShieldCheck size={16} />
                            <span>Private by design</span>
                        </div>

                        <div>
                            <Activity size={16} />
                            <span>Live market intelligence</span>
                        </div>

                    </div>

                </motion.div>


                {/* Intelligence glass object */}
                <motion.div
                    className="hero-visual"
                    initial={{
                        opacity: 0,
                        scale: 0.92,
                        rotateY: 10,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        rotateY: 0,
                    }}
                    transition={{
                        duration: 1,
                        delay: 0.2,
                    }}
                >

                    <div className="glass-intelligence">

                        <div className="visual-header">

                            <div>
                                <span className="visual-label">
                                    INVESTMENT SPACE
                                </span>

                                <h3>
                                    Portfolio intelligence
                                </h3>
                            </div>

                            <div className="live-pill">
                                <span />
                                LIVE
                            </div>

                        </div>


                        {/* Central intelligence */}
                        <div className="orbit-system">

                            <div className="orbit orbit-one" />
                            <div className="orbit orbit-two" />

                            <motion.div
                                className="core"
                                animate={{
                                    scale: [1, 1.06, 1],
                                    boxShadow: [
                                        "0 0 35px rgba(255,32,217,.25)",
                                        "0 0 65px rgba(32,217,255,.35)",
                                        "0 0 35px rgba(255,32,217,.25)",
                                    ],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                }}
                            >
                                <Sparkles size={28} />
                            </motion.div>

                            <div className="orbit-node node-a">
                                AAPL
                            </div>

                            <div className="orbit-node node-b">
                                RISK
                            </div>

                            <div className="orbit-node node-c">
                                AI
                            </div>

                        </div>


                        {/* Floating data */}
                        <motion.div
                            className="floating-data data-one"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                            }}
                        >
                            <span>PORTFOLIO RETURN</span>
                            <strong>+33.22%</strong>
                        </motion.div>

                        <motion.div
                            className="floating-data data-two"
                            animate={{ y: [0, 8, 0] }}
                            transition={{
                                duration: 4.5,
                                repeat: Infinity,
                            }}
                        >
                            <span>AI INSIGHT</span>
                            <strong>6 signals detected</strong>
                        </motion.div>


                        {/* Bottom status */}
                        <div className="visual-footer">

                            <div>
                                <span>MARKET DATA</span>
                                <strong>Connected</strong>
                            </div>

                            <div>
                                <span>RISK ENGINE</span>
                                <strong>Active</strong>
                            </div>

                            <div>
                                <span>AI CORE</span>
                                <strong>Ready</strong>
                            </div>

                        </div>

                    </div>

                </motion.div>

            </section>


            {/* Bottom statement */}
            <motion.div
                className="landing-bottom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <span>
                    Your portfolio is more than a number.
                </span>

                <span className="bottom-line" />

                <span>
                    Understand it.
                </span>
            </motion.div>

        </main>
    );
};

export default Landing;