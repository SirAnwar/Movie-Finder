import { loadMovies } from "./render.js";
import "./details.js";

// Elements
const searchInput = document.getElementById("searchInput");
const searchTitle = document.getElementById("searchTitle");
const resultsCount = document.getElementById("resultsCount");

// State
const params = new URLSearchParams(location.search);
const query = (params.get("q") || "").trim();

// Start
searchInput.value = query;
if (query) {
    const word = document.createElement("span");
    word.textContent = `"${query}"`;
    searchTitle.append(" عن ", word);
    const data = await loadMovies(`/search/multi?query=${encodeURIComponent(query)}`, "multi");
    if (data) resultsCount.textContent = `عدد النتائج: ${data.total_results.toLocaleString("ar-EG")}`;
}
