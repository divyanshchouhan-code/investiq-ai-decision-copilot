
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import "./Signup.css";
import {serverUrl} from "../../api/axios"

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${serverUrl}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      const token = data.token || data.jwtToken;

      if (!token) {
        throw new Error(
          "Account creation succeeded, but no token was returned."
        );
      }

      localStorage.setItem("investiq_token", token);

      if (data.user) {
        localStorage.setItem("investiq_user", JSON.stringify(data.user));
      }

      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-orb signup-orb-pink" />
      <div className="signup-orb signup-orb-blue" />
      <div className="signup-grid" />

      <Link to="/" className="signup-brand">
        <div className="signup-brand-mark">IQ</div>
        <span>InvestIQ</span>
      </Link>

      <section className="signup-layout">
        <motion.div
          className="signup-intro"
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="signup-eyebrow">
            <Sparkles size={15} />
            YOUR INVESTMENT JOURNEY STARTS HERE
          </div>

          <h1>
            Make your
            <br />
            portfolio work
            <br />
            <span className="signup-neon-text">for you.</span>
          </h1>

          <p>
            Understand your investments, discover portfolio risks,
            and make more informed financial decisions with InvestIQ.
          </p>
        </motion.div>

        <motion.div
          className="signup-card"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="signup-card-header">
            <div className="signup-card-icon">
              <UserRound size={21} />
            </div>

            <div>
              <span>CREATE YOUR ACCOUNT</span>
              <h2>Join InvestIQ</h2>
              <p>Start understanding your portfolio.</p>
            </div>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-input-group">
              <label htmlFor="signup-fullName">Full name</label>
              <div className="signup-input-wrapper">
                <UserRound size={17} />
                <input
                  id="signup-fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="signup-input-group">
              <label htmlFor="signup-email">Email address</label>
              <div className="signup-input-wrapper">
                <Mail size={17} />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="signup-input-group">
              <label htmlFor="signup-password">Password</label>
              <div className="signup-input-wrapper">
                <LockKeyhole size={17} />
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="signup-input-group">
              <label htmlFor="signup-confirmPassword">
                Confirm password
              </label>
              <div className="signup-input-wrapper">
                <LockKeyhole size={17} />
                <input
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="signup-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="signup-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="signup-footer">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </motion.div>
      </section>

      <div className="signup-status">
        <span className="signup-status-light" />
        INVESTIQ CORE ONLINE
      </div>
    </main>
  );
};

export default Signup;
