const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SESSION_EXPIRED = "انتهت الجلسة، يرجى تسجيل الدخول مجددًا";

// The guard: only lets the request through with a valid, up-to-date token cookie
const protect = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "يجب تسجيل الدخول أولًا" });

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        // Fake, edited or expired token
        return res.status(401).json({ message: SESSION_EXPIRED });
    }

    // The password was changed after this token was made → old session
    const user = await User.findById(payload.id).select("tokenVersion");
    if (!user || user.tokenVersion !== (payload.version ?? 0)) {
        return res.status(401).json({ message: SESSION_EXPIRED });
    }

    req.userId = payload.id;
    next();
};

module.exports = { protect };
