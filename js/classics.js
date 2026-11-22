import { fetchFromTMDB } from "./api.js";
import { renderMovies, showMessage } from "./render.js";
import "./details.js";
import "./nav.js";

// Config
const STEP = 8;

// Elements
const sortButtons = document.querySelectorAll("[data-sort]");

// State
let currentSort = "vote_count.desc";

// Sections
const sections = [
    {
        container: document.getElementById("hollywood"),
        button: document.getElementById("hollywoodMore"),
        path: "/discover/movie?with_original_language=en&primary_release_date.lte=1969-12-31&vote_count.gte=1000",
        max: 136,
    },
    {
        container: document.getElementById("arabic"),
        button: document.getElementById("arabicMore"),
        path: "/discover/movie?with_original_language=ar&primary_release_date.lte=1979-12-31&vote_count.gte=10",
        max: 64,
    },
];

// Sort
sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
        sortButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        currentSort = button.dataset.sort;
        sections.forEach(startSection);
    });
});

// Start
sections.forEach((section) => {
    section.button.addEventListener("click", () => showMore(section));
    startSection(section);
});

// Helpers
function startSection(section) {
    section.results = [];
    section.page = 0;
    section.totalPages = 1;
    section.shown = 0;
    section.version = (section.version || 0) + 1;
    showMessage(section.container, "جارٍ التحميل…");
    showMore(section);
}

async function showMore(section) {
    const version = section.version;
    section.button.hidden = true;
    const target = Math.min(section.shown + STEP, section.max);
    try {
        while (section.results.length < target && section.page < section.totalPages) {
            section.page++;
            const data = await fetchFromTMDB(`${section.path}&sort_by=${currentSort}&page=${section.page}`);
            if (version !== section.version) return;
            section.results.push(...data.results);
            section.totalPages = data.total_pages;
        }
        section.shown = Math.min(target, section.results.length);
        renderMovies(section.container, section.results.slice(0, section.shown), "movie");
        const hasMore = section.shown < section.results.length || section.page < section.totalPages;
        section.button.hidden = section.shown >= section.max || !hasMore;
    } catch (error) {
        console.error(error);
        showMessage(section.container, "حدث خطأ ما، يرجى المحاولة مرة أخرى.");
    }
}
