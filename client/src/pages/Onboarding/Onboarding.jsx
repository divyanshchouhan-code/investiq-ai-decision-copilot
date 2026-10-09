
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  ShieldCheck,
  TrendingUp,
  Wallet,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import "./Onboarding.css";

const GOALS = [
  {
    value: "Long Term Wealth",
    title: "Long-term wealth",
    description: "Build wealth steadily over time.",
    icon: TrendingUp,
  },
  {
    value: "Short Term Growth",
    title: "Short-term growth",
    description: "Focus on nearer-term growth goals.",
    icon: Target,
  },
  {
    value: "Retirement Planning",
    title: "Retirement planning",
    description: "Prepare for future financial needs.",
    icon: Wallet,
  },
  {
    value: "Regular Income",
    title: "Regular income",
    description: "Prioritize understanding income-producing assets.",
    icon: TrendingUp,
  },
  {
    value: "Capital Preservation",
    title: "Capital preservation",
    description: "Focus on understanding downside risk.",
    icon: ShieldCheck,
  },
];

const RISKS = [
  {
    value: "Conservative",
    title: "Conservative",
    description: "I prefer lower risk and more stability.",
  },
  {
    value: "Moderate",
    title: "Moderate",
    description: "I prefer a balance between risk and growth.",
  },
  {
    value: "Aggressive",
    title: "Aggressive",
    description: "I am comfortable with higher volatility.",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();

  const [investmentGoal, setInvestmentGoal] =
    useState("Long Term Wealth");
  const [riskPreference, setRiskPreference] = useState("Moderate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async (event) => {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("investiq_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            investmentGoal,
            riskPreference,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("investiq_token");
        localStorage.removeItem("investiq_user");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not save your preferences.");
      }

      if (data.user) {
        localStorage.setItem("investiq_user", JSON.stringify(data.user));
      }

      navigate("/investment-space", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/investment-space", { replace: true });
  };

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <button
          type="button"
          className="onboarding-back"
          onClick={() => navigate("/")}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="onboarding-brand">
          <div className="onboarding-brand-mark">IQ</div>
          <span>InvestIQ</span>
        </div>

        <button
          type="button"
          className="onboarding-skip"
          onClick={handleSkip}
        >
          Skip for now
        </button>
      </header>

      <motion.section
        className="onboarding-content"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="onboarding-progress">
          <span />
          <span />
          <span />
        </div>

        <div className="onboarding-eyebrow">
          <Target size={15} />
          PERSONALIZE YOUR EXPERIENCE
        </div>

        <h1>
          Let's understand
          <br />
          <span>your investment goals.</span>
        </h1>

        <p className="onboarding-subtitle">
          A few preferences help InvestIQ put your portfolio
          analysis into context. You can change these later.
        </p>

        <form onSubmit={handleContinue}>
          <section className="onboarding-section">
            <div className="onboarding-section-heading">
              <span className="onboarding-step-number">01</span>
              <div>
                <h2>What is your main investment goal?</h2>
                <p>Choose the goal closest to your current plans.</p>
              </div>
            </div>

            <div className="onboarding-goals">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const selected = investmentGoal === goal.value;

                return (
                  <button
                    key={goal.value}
                    type="button"
                    className={`onboarding-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => setInvestmentGoal(goal.value)}
                    aria-pressed={selected}
                  >
                    <span className="onboarding-option-icon">
                      <Icon size={19} />
                    </span>

                    <span className="onboarding-option-copy">
                      <strong>{goal.title}</strong>
                      <small>{goal.description}</small>
                    </span>

                    <span className="onboarding-radio">
                      {selected && <span />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="onboarding-section">
            <div className="onboarding-section-heading">
              <span className="onboarding-step-number">02</span>
              <div>
                <h2>How do you feel about investment risk?</h2>
                <p>This is your stated preference, not a risk assessment.</p>
              </div>
            </div>

            <div className="onboarding-risks">
              {RISKS.map((risk) => {
                const selected = riskPreference === risk.value;

                return (
                  <button
                    key={risk.value}
                    type="button"
                    className={`onboarding-risk ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => setRiskPreference(risk.value)}
                    aria-pressed={selected}
                  >
                    <span className="onboarding-risk-top">
                      <strong>{risk.title}</strong>
                      <span className="onboarding-radio">
                        {selected && <span />}
                      </span>
                    </span>

                    <small>{risk.description}</small>
                  </button>
                );
              })}
            </div>
          </section>

          {error && (
            <div className="onboarding-error" role="alert">
              {error}
            </div>
          )}

          <div className="onboarding-actions">
            <p>
              <ShieldCheck size={16} />
              Your preferences can be updated later.
            </p>

            <button
              type="submit"
              className="onboarding-continue"
              disabled={loading}
            >
              {loading ? "Saving preferences..." : "Continue"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </motion.section>
    </main>
  );
};

export default Onboarding;
