const express = require("express");
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Every favorites route needs a logged-in user
router.use(protect);

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:type/:tmdbId", removeFavorite);

module.exports = router;
