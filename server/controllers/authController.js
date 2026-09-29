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

module.exports = {
    register,
    login,
    getProfile,
}