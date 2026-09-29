const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');


const registerUser = async(userData) => {
    const {fullName, email, password} = userData;
    const existingUser = await User.findOne({email});

    if(existingUser){
        throw new Error("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
    });

    const token = generateToken(user._id);

    return {
        success: true,
        message: "Registration Successfull",
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            riskPreference: user.riskPreference,
            investmentGoal: user.investmentGoal,

        },
    };
};



const loginUser = async (userData) => {
    const { email, password } = userData;

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password.");
    }

    const token = generateToken(user._id);

    return {
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            riskPreference: user.riskPreference,
            investmentGoal: user.investmentGoal,
        },
    };
};

module.exports = {
    registerUser,
    loginUser,
};