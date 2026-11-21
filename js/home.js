
import { loadMovies } from "./render.js";
import "./details.js";

// Config
const TITLES = {
    all: "الرائج",
    movie: "الأفلام الرائجة",
    tv: "المسلسلات الرائجة",
    person: "النجوم الرائجون",
};

// Elements
const timeButtons = document.querySelectorAll("[data-time]");
const sectionTitle = document.getElementById("sectionTitle");

// State
const params = new URLSearchParams(location.search);
const type = params.get("type") || "all";
const currentType = TITLES[type] ? type : "all";
let currentTime = "day";

// Header
sectionTitle.textContent = TITLES[currentType];
if (currentType !== "all") {
    document.querySelector(`nav [data-type="${currentType}"]`).classList.add("active");
}

// Time toggle
timeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        timeButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        currentTime = button.dataset.time;
        getTrending(currentType, currentTime);
    });
});

// Helpers
function getTrending(type, time) {
    loadMovies(`/trending/${type}/${time}`, type, 1, 2);
}

// Start
getTrending(currentType, currentTime);
