const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendResetEmail } = require("../services/emailService");

// Same message for a wrong email or a wrong password,
// so nobody can find out which emails are registered
const INVALID_LOGIN = "البريد الإلكتروني أو كلمة المرور غير صحيحة";

// Same reply whether the email exists or not
const FORGOT_MESSAGE = "إذا كان هذا البريد مسجّلًا، ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.";

// The token cookie: hidden from JavaScript, sent only over HTTPS in production, lasts 7 days
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
};
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Sign a token with the user's id and put it in the cookie
const sendToken = (res, user) => {
    const token = jwt.sign({ id: user._id, version: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: "7d" });
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

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json({ message: FORGOT_MESSAGE });

    const token = user.createResetToken();
    await user.save();

    const link = `${process.env.CLIENT_URL}/pages/reset-password.html?token=${token}`;
    try {
        await sendResetEmail(user.email, link);
    } catch (err) {
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();
        throw err;
    }

    res.json({ message: FORGOT_MESSAGE });
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "الرابط أو كلمة المرور ناقصة" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "الرابط غير صالح أو منتهي الصلاحية" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.tokenVersion += 1;
    await user.save();

    res.json({ message: "تم تغيير كلمة المرور، يمكنك تسجيل الدخول الآن" });
};

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
