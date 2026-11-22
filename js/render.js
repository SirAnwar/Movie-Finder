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
const TYPE_NAMES = {
    movie: "فيلم",
    tv: "مسلسل",
};

// Elements
const loadMoreButton = document.getElementById("loadMore");

// State
let lastLoad = { container: null, path: "", type: "", page: 1, maxPages: Infinity };

// Load more
loadMoreButton?.addEventListener("click", () => {
    loadMovies(lastLoad.container, lastLoad.path, lastLoad.type, lastLoad.page + 1, lastLoad.maxPages);
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
function createMovieCard(movie, type, mixed) {
    const title = movie.title || movie.name;
    const original = movie.original_title || movie.original_name;
    const date = movie.release_date || movie.first_air_date;
    const rating = formatRating(movie.vote_average);
    const ratingClass = getRatingClass(movie.vote_average);
    const upcoming = date && new Date(date) > new Date();

    let badge = "";
    if (upcoming) badge = `<span class="badge">قادم</span>`;
    else if (movie.vote_count > 0) badge = `<span class="rating ${ratingClass}">${rating}</span>`;

    return `
        <article class="movie" data-id="${movie.id}" data-type="${type}" data-lang="${movie.original_language}">
            <div class="poster">
                <img src="${getImageUrl(movie.poster_path)}" alt="${title}">
                <button class="heart" aria-label="إضافة إلى المفضلة">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.4 5 6 5c2 0 3.4 1 4 2.2.6-1.2 2-2.2 4-2.2 3.6 0 5.4 3.4 4 6.7-2.5 4.7-10 9.3-10 9.3z"/></svg>
                </button>
                ${badge}
            </div>
            <h3 ${ARABIC.test(title) ? "" : `lang="${movie.original_language}"`}>${title}</h3>
            ${original !== title ? `<p class="original" lang="${movie.original_language}">${original}</p>` : ""}
            <p>${formatDate(date)}${mixed ? ` · ${TYPE_NAMES[type]}` : ""}</p>
        </article>`;
}
function createPersonCard(person) {
    return `
        <article class="movie" data-id="${person.id}" data-type="person">
            <div class="poster">
                <img src="${getImageUrl(person.profile_path)}" alt="${person.name}">
            </div>
            <h3>${person.name}</h3>
            ${person.original_name && person.original_name !== person.name ? `<p class="original">${person.original_name}</p>` : ""}
            <p>${DEPARTMENTS[person.known_for_department] || person.known_for_department}</p>
        </article>`;
}

// Render
export function renderMovies(container, movies, type, append) {
    if (movies.length === 0 && !append) {
        showMessage(container, "لا توجد نتائج.");
        return;
    }
    const mixed = type === "all" || type === "multi";
    const cards = movies.map((item) => {
        const itemType = item.media_type || type;
        return itemType === "person" ? createPersonCard(item) : createMovieCard(item, itemType, mixed);
    }).join("");
    if (append) {
        container.insertAdjacentHTML("beforeend", cards);
    } else {
        container.innerHTML = cards;
    }
}
export function showMessage(container, text) {
    container.innerHTML = `<p class="message">${text}</p>`;
}

// Load
export async function loadMovies(container, path, type, page = 1, maxPages = Infinity) {
    if (page === 1) showMessage(container, "جارٍ التحميل…");
    if (loadMoreButton) loadMoreButton.hidden = true;
    lastLoad = { container, path, type, page, maxPages };
    const separator = path.includes("?") ? "&" : "?";
    try {
        const data = await fetchFromTMDB(`${path}${separator}page=${page}`);
        renderMovies(container, data.results, type, page > 1);
        if (loadMoreButton) loadMoreButton.hidden = data.page >= Math.min(data.total_pages, maxPages);
        return data;
    } catch (error) {
        console.error(error);
        showMessage(container, "حدث خطأ ما، يرجى المحاولة مرة أخرى.");
    }
}
