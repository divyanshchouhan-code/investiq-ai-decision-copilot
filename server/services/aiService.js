const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateAIResponse = async (prompt) => {
    if (!prompt) {
        throw new Error("Prompt is required.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt
        });

        return response.text;
    } catch (error) {
        throw new Error(
            error.message || "Failed to generate AI response."
        );
    }
};

const generatePortfolioAnalysis = async (portfolioData) => {
    if (!portfolioData) {
        throw new Error("Portfolio data is required.");
    }

    const prompt = `
    You are InvestIQ, an AI investment insights assistant.

    Analyze the portfolio data below.

    PORTFOLIO DATA:
    ${JSON.stringify(portfolioData, null, 2)}

    Return ONLY valid JSON.
    Do not use markdown.
    Do not use code fences.
    Do not add any text before or after the JSON.

    Use exactly this structure:

    {
        "summary": "A concise overall summary of the portfolio.",
        "strengths": [
            "Strength 1",
            "Strength 2"
        ],
        "risks": [
            "Risk 1",
            "Risk 2"
        ],
        "riskAlignment": "Explain whether the portfolio risk is aligned with the user's risk preference.",
        "suggestions": [
            "General educational suggestion 1",
            "General educational suggestion 2"
        ]
    }

    Rules:
    - Use ONLY information explicitly provided in PORTFOLIO DATA.
    - Do not invent, assume, or infer facts that are not explicitly provided.
    - If a fact is not provided, do not mention it.
    - Do not assume a currency that is not provided.
    - Do not guarantee profits or losses.
    - Do not give direct buy or sell orders.
    - Suggestions must be general educational information.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt
        });

        const text = response.text.trim();

        return JSON.parse(text);
    } catch (error) {
        throw new Error(
            error.message || "Failed to generate portfolio analysis."
        );
    }
};

const generatePortfolioChatResponse = async (
    portfolioData,
    question
) => {
    if (!portfolioData) {
        throw new Error("Portfolio data is required.");
    }

    if (!question || !question.trim()) {
        throw new Error("Question is required.");
    }

    const prompt = `
    You are InvestIQ, an AI investment insights assistant.

    The user has asked a question about their investment portfolio.

    PORTFOLIO DATA:
    ${JSON.stringify(portfolioData, null, 2)}

    USER QUESTION:
    ${question}

    Answer the user's question using ONLY the information explicitly provided in PORTFOLIO DATA.

    Rules:
    - Do not invent financial data.
    - Do not assume facts that are not provided.
    - If the portfolio data does not contain enough information to answer something, clearly say that.
    - Explain financial concepts in simple language.
    - Do not guarantee profits or losses.
    - Do not provide direct buy or sell orders.
    - Do not tell the user exactly what they should buy or sell.
    - Suggestions, if relevant, must be general educational information.
    - Keep the response concise and useful.
    - Do not use markdown headings.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt
        });

        return response.text.trim();

    } catch (error) {
        throw new Error(
            error.message ||
            "Failed to generate AI chat response."
        );
    }
};

module.exports = {
    generateAIResponse,
    generatePortfolioAnalysis,
    generatePortfolioChatResponse
};