import { loadMovies } from "./render.js";
import "./details.js";
import "./nav.js";

// Elements
const searchInput = document.getElementById("searchInput");
const searchTitle = document.getElementById("searchTitle");
const resultsCount = document.getElementById("resultsCount");
const moviesContainer = document.getElementById("movies");
const emptyState = document.getElementById("emptyState");
const emptyWord = document.getElementById("emptyWord");
const searchDivider = document.getElementById("searchDivider");

// State
const params = new URLSearchParams(location.search);
const query = (params.get("q") || "").trim();

// Start
searchInput.value = query;
if (query) {
    const word = document.createElement("span");
    word.textContent = `"${query}"`;
    searchTitle.append(" عن ", word);
    const data = await loadMovies(moviesContainer, `/search/multi?query=${encodeURIComponent(query)}`, "multi");
    if (data && data.total_results === 0) {
        showEmptyState();
    } else if (data) {
        resultsCount.textContent = `عدد النتائج: ${data.total_results.toLocaleString("ar-EG")}`;
    }
}

// Helpers
function showEmptyState() {
    searchTitle.hidden = true;
    resultsCount.hidden = true;
    searchDivider.hidden = true;
    moviesContainer.innerHTML = "";
    emptyWord.textContent = `"${query}"`;
    emptyState.hidden = false;
}
