const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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

// The same user can't add the same title twice (different users can)
favoriteSchema.index({ user: 1, tmdbId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);