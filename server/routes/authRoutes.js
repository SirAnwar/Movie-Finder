const express = require("express");
const { register, login, logout, me, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter, forgotLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
