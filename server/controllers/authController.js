const User = require("../models/User");

// Same message for a wrong email or a wrong password,
// so nobody can find out which emails are registered
const INVALID_LOGIN = "البريد الإلكتروني أو كلمة المرور غير صحيحة";

// POST /api/auth/register
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
};

// POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: INVALID_LOGIN });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.checkPassword(password))) {
        return res.status(401).json({ message: INVALID_LOGIN });
    }

    res.json({ id: user._id, name: user.name, email: user.email });
};

module.exports = { register, login };
