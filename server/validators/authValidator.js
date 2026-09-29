const validateRegister = (data) => {
    const { fullName, email, password } = data;

    if (!fullName || !email || !password) {
        return "All fields are required.";
    }

    if (password.length < 8) {
        return "Password must be at least 8 characters.";
    }

    return null;
};

const validateLogin = (data) => {
    const { email, password } = data;

    if (!email || !password) {
        return "Email and password are required.";
    }

    return null;
};

module.exports = {
    validateRegister,
    validateLogin,
};