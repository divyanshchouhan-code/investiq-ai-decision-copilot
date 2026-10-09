const { registerUser,loginUser} = require("../services/authService");
const { validateRegister, validateLogin } = require("../validators/authValidator");

const register = async(req, res) => {
    try{
        const error = validateRegister(req.body);
        if(error){
            return res.status(400).json({
                success: false,
                message: error,
            });
        }

        const result = await registerUser(req.body);
        return res.status(201).json(result)
    }catch(error){
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


const login = async (req, res) => {
    try {
        const error = validateLogin(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error,
            });
        }

        const result = await loginUser(req.body);

        return res.status(200).json(result);

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

const User = require("../models/User");

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { riskPreference, investmentGoal } = req.body;

        const allowedRiskPreferences = [
            "Conservative",
            "Moderate",
            "Aggressive",
        ];

        if (
            riskPreference !== undefined &&
            !allowedRiskPreferences.includes(riskPreference)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid risk preference.",
            });
        }

        if (
            investmentGoal !== undefined &&
            (typeof investmentGoal !== "string" ||
                !investmentGoal.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid investment goal.",
            });
        }

        const updates = {};

        if (riskPreference !== undefined) {
            updates.riskPreference = riskPreference;
        }

        if (investmentGoal !== undefined) {
            updates.investmentGoal = investmentGoal.trim();
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile.",
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
};