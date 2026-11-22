import { fetchFromTMDB } from "./api.js";
import { renderMovies, showMessage } from "./render.js";
import "./details.js";
import "./nav.js";

// Config
const STEP = 8;
const MAX = 48;

// Sections
const sections = [
    {
        container: document.getElementById("hollywood"),
        button: document.getElementById("hollywoodMore"),
        path: "/discover/movie?with_original_language=en&primary_release_date.lte=1969-12-31&sort_by=vote_count.desc",
    },
    {
        container: document.getElementById("arabic"),
        button: document.getElementById("arabicMore"),
        path: "/discover/movie?with_original_language=ar&primary_release_date.lte=1979-12-31&sort_by=vote_count.desc",
    },
];

// Start
sections.forEach((section) => {
    section.results = [];
    section.page = 0;
    section.totalPages = 1;
    section.shown = 0;
    section.button.addEventListener("click", () => showMore(section));
    showMessage(section.container, "جارٍ التحميل…");
    showMore(section);
});

// Helpers
async function showMore(section) {
    section.button.hidden = true;
    const target = Math.min(section.shown + STEP, MAX);
    try {
        while (section.results.length < target && section.page < section.totalPages) {
            section.page++;
            const data = await fetchFromTMDB(`${section.path}&page=${section.page}`);
            section.results.push(...data.results);
            section.totalPages = data.total_pages;
        }
        section.shown = Math.min(target, section.results.length);
        renderMovies(section.container, section.results.slice(0, section.shown), "movie");
        const hasMore = section.shown < section.results.length || section.page < section.totalPages;
        section.button.hidden = section.shown >= MAX || !hasMore;
    } catch (error) {
        console.error(error);
        showMessage(section.container, "حدث خطأ ما، يرجى المحاولة مرة أخرى.");
    }
}
