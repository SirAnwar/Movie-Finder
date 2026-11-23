const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Same message for a wrong email or a wrong password,
// so nobody can find out which emails are registered
const INVALID_LOGIN = "البريد الإلكتروني أو كلمة المرور غير صحيحة";

// The token cookie: hidden from JavaScript, sent only over HTTPS in production, lasts 7 days
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
};
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Sign a token with the user's id and put it in the cookie
const sendToken = (res, user) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { ...COOKIE_OPTIONS, maxAge: SEVEN_DAYS });
};

// POST /api/auth/register (logs the new user in right away)
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    sendToken(res, user);
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

    sendToken(res, user);
    res.json({ id: user._id, name: user.name, email: user.email });
};

// POST /api/auth/logout
const logout = (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.json({ message: "تم تسجيل الخروج" });
};

// GET /api/auth/me (who is logged in right now)
const me = async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "يجب تسجيل الدخول أولًا" });
    res.json({ id: user._id, name: user.name, email: user.email });
};

module.exports = { register, login, logout, me };
