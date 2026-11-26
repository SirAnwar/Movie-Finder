import { apiRequest } from "./auth-api.js";
import { renderMovies, showMessage } from "./render.js";
import { sessionReady } from "./session.js";
import "./details.js";
import "./nav.js";

// Elements
const favoritesGrid = document.getElementById("favorites");
const favoritesCount = document.getElementById("favoritesCount");
const emptyBox = document.getElementById("emptyBox");
const guestBox = document.getElementById("guestBox");

// State
let count = 0;

// Our saved favorite → the TMDB shape that renderMovies expects
function toTmdbItem(favorite) {
    return {
        id: favorite.tmdbId,
        media_type: favorite.type,
        title: favorite.title,
        original_title: favorite.originalTitle,
        original_language: favorite.originalLanguage,
        poster_path: favorite.posterPath,
        release_date: favorite.date,
        vote_average: favorite.rating ?? 0,
        vote_count: favorite.rating ? 1 : 0, // the card shows a rating only when there are votes
    };
}

function showCount() {
    favoritesCount.textContent = `عدد الأفلام المحفوظة: ${count.toLocaleString("ar-EG")}`;
}

function showEmpty() {
    favoritesGrid.replaceChildren();
    favoritesCount.textContent = "ستظهر هنا الأفلام التي تحفظها.";
    emptyBox.hidden = false;
}

// Guests see the login box, users see their saved titles (newest first, from the server)
async function loadFavorites() {
    emptyBox.hidden = true;
    const user = await sessionReady;
    if (!user) {
        guestBox.hidden = false;
        return;
    }

    showMessage(favoritesGrid, "جارٍ التحميل…");
    try {
        const favorites = await apiRequest("/favorites");
        if (favorites.length === 0) {
            showEmpty();
            return;
        }
        count = favorites.length;
        showCount();
        renderMovies(favoritesGrid, favorites.map(toTmdbItem), "all");
    } catch (error) {
        showMessage(favoritesGrid, error.message);
    }
}

// A heart changed on this page: remove the un-saved card, or reload after a re-save
document.addEventListener("favorite-change", async (event) => {
    const { type, id, saved } = event.detail;

    // Saved again (from the details dialog): just reload the list
    if (saved) {
        loadFavorites();
        return;
    }

    const card = favoritesGrid.querySelector(`.movie[data-type="${type}"][data-id="${id}"]`);
    if (!card) return;

    await card.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.9 }], { duration: 200 }).finished;
    card.remove();

    count--;
    if (count === 0) showEmpty();
    else showCount();
});

loadFavorites();
