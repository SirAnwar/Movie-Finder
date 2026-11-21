import { fetchFromTMDB } from "./api.js";

// Config
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
export const DEPARTMENTS = {
    Acting: "تمثيل",
    Directing: "إخراج",
    Writing: "كتابة",
    Production: "إنتاج",
    Sound: "صوت",
    Camera: "تصوير",
    Editing: "مونتاج",
    Art: "تصميم فني",
    Crew: "طاقم العمل",
    "Costume & Make-Up": "أزياء ومكياج",
    "Visual Effects": "مؤثرات بصرية",
    Lighting: "إضاءة",
    Creator: "صناعة المحتوى",
};
export const ARABIC = /[؀-ۿ]/;

// Elements
const moviesContainer = document.getElementById("movies");
const loadMoreButton = document.getElementById("loadMore");

// State
let lastLoad = { path: "", type: "", page: 1, maxPages: Infinity };

// Load more
loadMoreButton.addEventListener("click", () => {
    loadMovies(lastLoad.path, lastLoad.type, lastLoad.page + 1, lastLoad.maxPages);
});

// Helpers
export function getImageUrl(path) {
    return path ? IMAGE_URL + path : "/images/no-image.svg";
}
function getRatingClass(score) {
    if (score >= 7) return "high";
    if (score >= 5) return "mid";
    return "low";
}
export function formatDate(dateString) {
    if (!dateString) return "تاريخ غير معروف";
    return new Date(dateString).toLocaleDateString("ar-EG", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}
export function formatRating(score) {
    return score.toLocaleString("ar-EG", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Cards
function createMovieCard(movie, type) {
    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const rating = formatRating(movie.vote_average);
    const ratingClass = getRatingClass(movie.vote_average);
    return `
        <article class="movie" data-id="${movie.id}" data-type="${type}" data-lang="${movie.original_language}">
            <div class="poster">
                <img src="${getImageUrl(movie.poster_path)}" alt="${title}">
                <button class="heart" aria-label="إضافة إلى المفضلة">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.4 5 6 5c2 0 3.4 1 4 2.2.6-1.2 2-2.2 4-2.2 3.6 0 5.4 3.4 4 6.7-2.5 4.7-10 9.3-10 9.3z"/></svg>
                </button>
                <span class="rating ${ratingClass}">${rating}</span>
            </div>
            <h3 ${ARABIC.test(title) ? "" : 'lang="en"'}>${title}</h3>
            <p>${formatDate(date)}</p>
        </article>`;
}
function createPersonCard(person) {
    return `
        <article class="movie" data-id="${person.id}" data-type="person">
            <div class="poster">
                <img src="${getImageUrl(person.profile_path)}" alt="${person.name}">
            </div>
            <h3>${person.name}</h3>
            <p>${DEPARTMENTS[person.known_for_department] || person.known_for_department}</p>
        </article>`;
}

// Render
function renderMovies(movies, type, append) {
    if (movies.length === 0 && !append) {
        showMessage("لا توجد نتائج.");
        return;
    }
    const cards = movies.map((item) => {
        const itemType = item.media_type || type;
        return itemType === "person" ? createPersonCard(item) : createMovieCard(item, itemType);
    }).join("");
    if (append) {
        moviesContainer.insertAdjacentHTML("beforeend", cards);
    } else {
        moviesContainer.innerHTML = cards;
    }
}
function showMessage(text) {
    moviesContainer.innerHTML = `<p class="message">${text}</p>`;
}

// Load
export async function loadMovies(path, type, page = 1, maxPages = Infinity) {
    if (page === 1) showMessage("جارٍ التحميل…");
    loadMoreButton.hidden = true;
    lastLoad = { path, type, page, maxPages };
    const separator = path.includes("?") ? "&" : "?";
    try {
        const data = await fetchFromTMDB(`${path}${separator}page=${page}`);
        renderMovies(data.results, type, page > 1);
        loadMoreButton.hidden = data.page >= Math.min(data.total_pages, maxPages);
        return data;
    } catch (error) {
        console.error(error);
        showMessage("حدث خطأ ما، يرجى المحاولة مرة أخرى.");
    }
}
