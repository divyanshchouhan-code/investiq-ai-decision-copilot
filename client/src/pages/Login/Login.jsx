import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    LockKeyhole,
    Mail,
    Sparkles,
    ShieldCheck,
} from "lucide-react";

import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed."
                );
            }

            const token =
                data.token || data.jwtToken;

            if (!token) {
                throw new Error(
                    "Login succeeded but no token was returned."
                );
            }

            localStorage.setItem(
                "investiq_token",
                token
            );

            navigate("/investment-space");

            console.log(
                "InvestIQ login successful"
            );

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">

            {/* Liquid background */}
            <div className="login-orb login-orb-pink" />
            <div className="login-orb login-orb-blue" />
            <div className="login-orb login-orb-purple" />

            <div className="login-grid" />


            {/* Top brand */}
            <motion.div
                className="login-brand"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="login-brand-mark">
                    IQ
                </div>

                <span>InvestIQ</span>
            </motion.div>


            {/* Main */}
            <section className="login-layout">

                {/* Left information */}
                <motion.div
                    className="login-intro"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                >

                    <div className="login-eyebrow">
                        <Sparkles size={14} />
                        YOUR INVESTMENT SPACE
                    </div>

                    <h1>
                        Welcome
                        <br />
                        <span className="neon-text">
                            back.
                        </span>
                    </h1>

                    <p>
                        Your portfolio intelligence is
                        waiting for you. Enter your space
                        and continue exploring your
                        investments.
                    </p>


                    <div className="login-features">

                        <div>
                            <div className="feature-icon">
                                <ShieldCheck size={17} />
                            </div>

                            <div>
                                <strong>
                                    Private by design
                                </strong>

                                <span>
                                    Your portfolio stays yours.
                                </span>
                            </div>
                        </div>


                        <div>
                            <div className="feature-icon">
                                <Sparkles size={17} />
                            </div>

                            <div>
                                <strong>
                                    AI intelligence
                                </strong>

                                <span>
                                    Understand your investments
                                    differently.
                                </span>
                            </div>
                        </div>

                    </div>

                </motion.div>


                {/* Login glass */}
                <motion.div
                    className="login-card"
                    initial={{
                        opacity: 0,
                        scale: 0.95,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.7,
                        delay: 0.1,
                    }}
                >

                    {/* Card glow */}
                    <div className="card-glow" />


                    <div className="login-card-content">

                        <div className="login-card-header">

                            <div className="lock-icon">
                                <LockKeyhole size={19} />
                            </div>

                            <div>
                                <span>
                                    SECURE ACCESS
                                </span>

                                <h2>
                                    Enter your space
                                </h2>
                            </div>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="login-form"
                        >

                            {/* Email */}
                            <div className="input-group">

                                <label>
                                    Email
                                </label>

                                <div className="input-wrapper">

                                    <Mail size={17} />

                                    <input
                                        type="email"
                                        placeholder="you@gmail.com"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* Password */}
                            <div className="input-group">

                                <label>
                                    Password
                                </label>

                                <div className="input-wrapper">

                                    <LockKeyhole size={17} />

                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* Error */}
                            {error && (
                                <div className="login-error">
                                    {error}
                                </div>
                            )}


                            {/* Submit */}
                            <button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Entering..."
                                    : "Enter InvestIQ"}

                                {!loading && (
                                    <ArrowRight size={18} />
                                )}
                            </button>

                        </form>


                        <div className="login-divider">
                            <span />
                            <p>SECURED CONNECTION</p>
                            <span />
                        </div>


                        <div className="login-footer">

                            <span>
                                New to InvestIQ?
                            </span>

                            <button type="button">
                                Create your account
                            </button>

                        </div>

                    </div>

                </motion.div>

            </section>


            {/* Bottom status */}
            <div className="login-status">

                <span className="status-light" />

                INVESTIQ CORE ONLINE

                <span className="status-separator">
                    /
                </span>

                ENCRYPTED SESSION

            </div>

        </main>
    );
};

export default Login;