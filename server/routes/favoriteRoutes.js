const express = require("express");
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favoriteController");

const router = express.Router();

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:type/:tmdbId", removeFavorite);

module.exports = router;
