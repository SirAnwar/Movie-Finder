const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        tmdbId: { type: Number, required: true },
        type: { type: String, enum: ["movie", "tv"], required: true },
        title: { type: String, required: true },
        originalTitle: String,
        originalLanguage: String,
        posterPath: String,
        date: String,
        rating: Number,
    },
    { timestamps: true }
);

favoriteSchema.index({ tmdbId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);