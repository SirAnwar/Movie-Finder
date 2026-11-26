import { apiRequest } from "./auth-api.js";
import { fetchFromTMDB } from "./api.js";
import { renderMovies, showSkeleton, showError, formatRating, getRatingClass } from "./render.js";
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

// The saved rating may be old: ask TMDB for today's rating, in the background
function refreshRatings(favorites) {
    for (const favorite of favorites) {
        fetchFromTMDB(`/${favorite.type}/${favorite.tmdbId}`)
            .then((data) => {
                const card = favoritesGrid.querySelector(`.movie[data-type="${favorite.type}"][data-id="${favorite.tmdbId}"]`);
                const rating = card?.querySelector(".rating");
                if (!rating || !data.vote_count) return;
                rating.textContent = formatRating(data.vote_average);
                rating.className = `rating ${getRatingClass(data.vote_average)}`;
            })
            .catch(() => {}); // keep the saved rating
    }
}

// Guests see the login box, users see their saved titles (newest first, from the server)
async function loadFavorites() {
    emptyBox.hidden = true;
    const user = await sessionReady;
    if (!user) {
        guestBox.hidden = false;
        return;
    }

    showSkeleton(favoritesGrid);
    try {
        const favorites = await apiRequest("/favorites");
        if (favorites.length === 0) {
            showEmpty();
            return;
        }
        count = favorites.length;
        showCount();
        renderMovies(favoritesGrid, favorites.map(toTmdbItem), "all");
        refreshRatings(favorites);
    } catch (error) {
        showError(favoritesGrid, error, loadFavorites);
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
