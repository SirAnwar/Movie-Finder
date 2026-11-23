const jwt = require("jsonwebtoken");

// The guard: only lets the request through with a valid token cookie
const protect = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "يجب تسجيل الدخول أولًا" });

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = id;
        next();
    } catch {
        // Fake, edited or expired token
        res.status(401).json({ message: "انتهت الجلسة، يرجى تسجيل الدخول مجددًا" });
    }
};

module.exports = { protect };
