require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const favoriteRoutes = require("./routes/favoriteRoutes");
const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);

// Errors (always last)
app.use(notFound);
app.use(errorHandler);

// Start
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});