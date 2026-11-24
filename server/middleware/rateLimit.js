const rateLimit = require("express-rate-limit");

// Max 10 login/register attempts per 15 minutes from the same IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { message: "محاولات كثيرة، يرجى المحاولة بعد ١٥ دقيقة" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Max 3 reset emails per hour from the same IP
const forgotLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: { message: "طلبات كثيرة، يرجى المحاولة بعد ساعة" },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, forgotLimiter };
