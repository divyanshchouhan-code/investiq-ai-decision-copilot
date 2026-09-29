import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    BrainCircuit,
    Sparkles,
} from "lucide-react";

import "./AICopilot.css";

const AICopilot = () => {

    const [question, setQuestion] = useState("");
    const [response, setResponse] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAskAI = async (event) => {
        event.preventDefault();

        if (!question.trim()) {
            return;
        }

        setLoading(true);
        setError("");
        setResponse("");

        try {
            const token =
                localStorage.getItem(
                    "investiq_token"
                );

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const apiResponse =
                await fetch(
                    "http://localhost:5000/api/ai/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            question:
                                question.trim(),
                        }),
                    }
                );

            const data =
                await apiResponse.json();

            if (!apiResponse.ok) {
                throw new Error(
                    data.message ||
                    "Failed to get AI response."
                );
            }

            setResponse(
                data.response
            );

        } catch (error) {

            console.error(
                "AI Copilot error:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setLoading(false);

        }
    };

    const handleSuggestionClick = (
        suggestion
    ) => {
        setQuestion(suggestion);
    };

    return (

        <motion.section
            className="ai-copilot glass"

            initial={{
                opacity: 0,
                y: 30,
            }}

            animate={{
                opacity: 1,
                y: 0,
            }}

            transition={{
                duration: 0.7,
            }}
        >

            {/* Header */}

            <div className="copilot-header">

                <div className="copilot-core">
                    <Sparkles size={22} />
                </div>

                <div>

                    <span>
                        ASK INVESTIQ
                    </span>

                    <h2>
                        Your financial copilot
                    </h2>

                </div>

                <div className="copilot-status">

                    <span />

                    READY

                </div>

            </div>


            {/* Description */}

            <p className="copilot-description">
                Ask questions about your portfolio
                and let InvestIQ explain what your
                data means.
            </p>


            {/* AI Response */}

            {response && (

                <motion.div
                    className="copilot-response"

                    initial={{
                        opacity: 0,
                        y: 10,
                    }}

                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                >

                    <div className="response-label">

                        <Sparkles size={14} />

                        INVESTIQ

                    </div>

                    <p>
                        {response}
                    </p>

                </motion.div>

            )}


            {/* Error */}

            {error && (

                <div className="copilot-error">
                    {error}
                </div>

            )}


            {/* Input */}

            <form
                className="copilot-form"
                onSubmit={handleAskAI}
            >

                <div className="input-icon">
                    <BrainCircuit size={18} />
                </div>

                <input
                    type="text"

                    placeholder="Ask InvestIQ anything about your portfolio..."

                    value={question}

                    onChange={(event) =>
                        setQuestion(
                            event.target.value
                        )
                    }

                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={
                        loading ||
                        !question.trim()
                    }
                >

                    {loading ? (
                        "Thinking..."
                    ) : (
                        <>
                            Ask

                            <ArrowUpRight
                                size={16}
                            />
                        </>
                    )}

                </button>

            </form>


            {/* Suggestions */}

            <div className="suggested-questions">

                <button
                    type="button"
                    onClick={() =>
                        handleSuggestionClick(
                            "Why is my portfolio risk so high?"
                        )
                    }
                >
                    Why is my risk high?
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleSuggestionClick(
                            "Explain my portfolio in simple words."
                        )
                    }
                >
                    Explain my portfolio
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleSuggestionClick(
                            "What is affecting my portfolio the most?"
                        )
                    }
                >
                    What's affecting me?
                </button>

            </div>

        </motion.section>

    );
};

export default AICopilot;