const rateLimit = require("express-rate-limit");

// Max 10 login/register attempts per 15 minutes from the same IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { message: "محاولات كثيرة، يرجى المحاولة بعد ١٥ دقيقة" },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter };
