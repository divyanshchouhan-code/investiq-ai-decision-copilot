import { motion } from "framer-motion";
import {
    ArrowDownRight,
    ArrowUpRight,
    Minus,
    ShieldAlert,
    Sparkles,
} from "lucide-react";

import "./ActionIntelligence.css";


const signalConfig = {
    ADD: {
        label: "CONSIDER ADDING",
        icon: ArrowUpRight,
        className: "action-add",
    },

    HOLD: {
        label: "HOLD",
        icon: Minus,
        className: "action-hold",
    },

    REDUCE: {
        label: "REDUCE",
        icon: ArrowDownRight,
        className: "action-reduce",
    },

    EXIT: {
        label: "EXIT",
        icon: ShieldAlert,
        className: "action-exit",
    },
};


const ActionIntelligence = ({ actions = [] }) => {

    if (!actions.length) {
        return (
            <motion.section
                className="action-intelligence glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="action-header">
                    <div>
                        <span className="section-eyebrow">
                            ACTION INTELLIGENCE
                        </span>

                        <h2>
                            No action signals yet
                        </h2>

                        <p>
                            Add investments to generate
                            portfolio-aware signals.
                        </p>
                    </div>

                    <Sparkles size={24} />
                </div>
            </motion.section>
        );
    }


    return (
        <motion.section
            className="action-intelligence glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >

            <div className="action-header">

                <div>

                    <span className="section-eyebrow">
                        ACTION INTELLIGENCE
                    </span>

                    <h2>
                        What deserves your attention?
                    </h2>

                    <p>
                        Portfolio-aware signals based on
                        your current investment data.
                    </p>

                </div>

                <div className="action-ai-icon">
                    <Sparkles size={22} />
                </div>

            </div>


            <div className="action-disclaimer">
                <span>
                    Signals are generated from available
                    portfolio data and are not guarantees.
                </span>
            </div>


            <div className="action-list">

                {actions.map((action, index) => {

                    const config =
                        signalConfig[action.signal] ||
                        signalConfig.HOLD;

                    const Icon = config.icon;

                    return (
                        <motion.article
                            key={`${action.symbol}-${index}`}
                            className={`action-card ${config.className}`}
                            initial={{
                                opacity: 0,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: index * 0.08,
                            }}
                        >

                            <div className="action-card-top">

                                <div className="action-symbol">

                                    <div className="symbol-orb">
                                        {action.symbol?.charAt(0)}
                                    </div>

                                    <div>
                                        <h3>
                                            {action.symbol}
                                        </h3>

                                        <span>
                                            Holding signal
                                        </span>
                                    </div>

                                </div>


                                <div
                                    className={`action-signal ${config.className}`}
                                >
                                    <Icon size={16} />

                                    <span>
                                        {config.label}
                                    </span>
                                </div>

                            </div>


                            <div className="action-reason">

                                <span className="reason-label">
                                    WHY
                                </span>

                                <p>
                                    {action.reason}
                                </p>

                            </div>


                            <div className="action-metrics">

                                <div>
                                    <span>
                                        Portfolio weight
                                    </span>

                                    <strong>
                                        {action.metrics?.concentration ?? 0}%
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Return
                                    </span>

                                    <strong>
                                        {action.metrics?.returnPercentage ?? 0}%
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Current value
                                    </span>

                                    <strong>
                                        ₹{action.metrics?.currentValue ?? 0}
                                    </strong>
                                </div>

                            </div>


                            {action.reasons?.length > 0 && (

                                <div className="action-evidence">

                                    <span className="evidence-label">
                                        SIGNAL EVIDENCE
                                    </span>

                                    <ul>

                                        {action.reasons.map(
                                            (reason, reasonIndex) => (
                                                <li key={reasonIndex}>
                                                    {reason}
                                                </li>
                                            )
                                        )}

                                    </ul>

                                </div>

                            )}

                        </motion.article>
                    );
                })}

            </div>

        </motion.section>
    );
};


export default ActionIntelligence;