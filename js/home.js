import { loadMovies } from "./render.js";
import "./details.js";

// Config
const PLACEHOLDERS = {
    movie: "ابحث عن فيلم…",
    tv: "ابحث عن مسلسل…",
    person: "ابحث عن شخص…",
};

// Elements
const searchInput = document.getElementById("searchInput");
const timeButtons = document.querySelectorAll("[data-time]");
const typeLinks = document.querySelectorAll("[data-type]");
const sectionTitle = document.getElementById("sectionTitle");
const timeToggle = document.getElementById("timeToggle");
const searchForm = document.getElementById("searchForm");

// State
let currentType = "movie";
let currentTime = "day";

// Time toggle
timeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        timeButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        currentTime = button.dataset.time;
        getTrending(currentType, currentTime);
    });
});

// Type links
typeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        typeLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
        currentType = link.dataset.type;
        searchInput.placeholder = PLACEHOLDERS[currentType];
        getTrending(currentType, currentTime);
        setSectionHeader("الرائج", false);
    });
});

// Search
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    const typeName = document.querySelector(`[data-type="${currentType}"]`).textContent;
    setSectionHeader(`${typeName} › "${query}"`, true);
    getSearch(currentType, query);
});

// Helpers
function setSectionHeader(title, hideTime) {
    sectionTitle.textContent = title;
    timeToggle.hidden = hideTime;
}

function getTrending(type, time) {
    loadMovies(`/trending/${type}/${time}`, type);
}

function getSearch(type, query) {
    loadMovies(`/search/${type}?query=${encodeURIComponent(query)}`, type);
}

// Start
getTrending(currentType, currentTime);
