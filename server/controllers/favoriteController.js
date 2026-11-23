const Favorite = require("../models/Favorite");

// All routes here run after the auth guard, so req.userId is the logged-in user

// GET /api/favorites
const getFavorites = async (req, res) => {
    const favorites = await Favorite.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(favorites);
};

// POST /api/favorites
const addFavorite = async (req, res) => {
    const { tmdbId, type, title, originalTitle, originalLanguage, posterPath, date, rating } = req.body;
    const favorite = await Favorite.create({
        user: req.userId, // from the token, never from the body
        tmdbId, type, title, originalTitle, originalLanguage, posterPath, date, rating,
    });
    res.status(201).json(favorite);
};

// DELETE /api/favorites/:type/:tmdbId
const removeFavorite = async (req, res) => {
    const { type, tmdbId } = req.params;
    const favorite = await Favorite.findOneAndDelete({ user: req.userId, type, tmdbId });
    if (!favorite) return res.status(404).json({ message: "الفيلم غير موجود في المفضّلة" });
    res.json({ message: "تمت الإزالة من المفضّلة" });
};

module.exports = { getFavorites, addFavorite, removeFavorite };
