// Config
const BASE_URL = "/api";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDERS = {
    movie: "ابحث عن فيلم…",
    tv: "ابحث عن مسلسل…",
    person: "ابحث عن شخص…",
};
const DEPARTMENTS = {
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
const ARABIC = /[؀-ۿ]/;
const TRAILER_BUTTON = {
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>شاهد الإعلان`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>إغلاق الإعلان`,
};

// Elements 
const searchInput = document.getElementById("searchInput");
const moviesContainer = document.getElementById("movies");
const timeButtons = document.querySelectorAll("[data-time]");
const typeLinks = document.querySelectorAll("[data-type]");
const sectionTitle = document.getElementById("sectionTitle");
const timeToggle = document.getElementById("timeToggle");
const searchForm = document.getElementById("searchForm");
const loadMoreButton = document.getElementById("loadMore");
const detailsDialog = document.getElementById("details");
const closeDetailsButton = document.getElementById("closeDetails");
const detailsContent = document.getElementById("detailsContent");

// State 
let currentType = "movie";
let currentTime = "day";
let lastLoad = { path: "", type: "", page: 1 };

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
        searchInput.placeholder = PLACEHOLDERS[ currentType ];
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

// Load more
loadMoreButton.addEventListener("click", () => {
    loadMovies(lastLoad.path, lastLoad.type, lastLoad.page + 1);
});

// Details
moviesContainer.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (!card) return;
    openDetails(lastLoad.type, card.dataset.id, card.dataset.lang);
});

closeDetailsButton.addEventListener("click", () => {
    detailsDialog.close();
});

detailsDialog.addEventListener("click", (event) => {
    if (event.target === detailsDialog) detailsDialog.close();
});

detailsContent.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (!button) return;
    const player = detailsContent.querySelector(".player");
    if (player) {
        player.remove();
        button.innerHTML = TRAILER_BUTTON.play;
    } else {
        detailsContent.insertAdjacentHTML("beforeend", `<iframe class="player" src="https://www.youtube-nocookie.com/embed/${button.dataset.key}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`);
        button.innerHTML = TRAILER_BUTTON.close;
    }
});

detailsDialog.addEventListener("close", () => {
    detailsContent.innerHTML = "";
});

// Render
function getImageUrl(path) {
    return path ? IMAGE_URL + path : "images/no-image.svg";
}
function getRatingClass(score) {
    if (score >= 7) return "high";
    if (score >= 5) return "mid";
    return "low";
}
function formatDate(dateString) {
    if (!dateString) return "تاريخ غير معروف";
    return new Date(dateString).toLocaleDateString("ar-EG", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}
function formatRating(score) {
    return score.toLocaleString("ar-EG", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function createMovieCard(movie) {
    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const rating = formatRating(movie.vote_average);
    const ratingClass = getRatingClass(movie.vote_average);
    return `
                <article class="movie" data-id="${movie.id}" data-lang="${movie.original_language}">
                    <div class="poster">
                        <img src="${getImageUrl(movie.poster_path)}" alt="${title}">
                        <button class="heart" aria-label="إضافة إلى المفضلة">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.4 5 6 5c2 0 3.4 1 4 2.2.6-1.2 2-2.2 4-2.2 3.6 0 5.4 3.4 4 6.7-2.5 4.7-10 9.3-10 9.3z"/></svg>
                        </button>
                        <span class="rating ${ratingClass}">${rating}</span>
                    </div>
                    <h3 ${ARABIC.test(title) ? "" : 'lang="en"'}>${title}</h3>
                    <p>${formatDate(date)}</p>
                </article>`
}
function createPersonCard(person) {
    return `
                <article class="movie" data-id="${person.id}">
                    <div class="poster">
                        <img src="${getImageUrl(person.profile_path)}" alt="${person.name}">
                    </div>
                    <h3>${person.name}</h3>
                    <p>${DEPARTMENTS[person.known_for_department] || person.known_for_department}</p>
                </article>`;
}

function createMovieDetails(movie) {
    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const year = date ? Number(date.slice(0, 4)).toLocaleString("ar-EG", { useGrouping: false }) : "غير معروف";
    const hours = Math.floor(movie.runtime / 60).toLocaleString("ar-EG");
    const minutes = (movie.runtime % 60).toLocaleString("ar-EG");
    const length = movie.number_of_seasons ? `المواسم: ${movie.number_of_seasons.toLocaleString("ar-EG")}` : `${hours} س ${minutes} د`;
    const genres = movie.genres.map((genre) => `<span class="genre">${genre.name}</span>`).join("");
    const trailer = movie.videos.results.find((video) => video.site === "YouTube" && video.type === "Trailer");
    const overview = movie.overview || movie.translations.translations.find((item) => item.iso_639_1 === "en")?.data.overview;

    return `
        <div class="details-main">
            <div class="details-poster">
                <img src="${getImageUrl(movie.poster_path)}" alt="${title}">
            </div>
            <div class="details-info">
                <h2 ${ARABIC.test(title) ? "" : 'lang="en"'}>${title}</h2>
                ${movie.tagline ? `<p class="tagline">${movie.tagline}</p>` : ""}
                <p class="meta">
                    <span class="score"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6z"/></svg>${formatRating(movie.vote_average)}</span>
                    <span aria-hidden="true">•</span>
                    <span>${year}</span>
                    <span aria-hidden="true">•</span>
                    <span>${length}</span>
                </p>
                <div class="genres">${genres}</div>
                <div class="actions">
                    ${trailer ? `<button class="btn btn-primary trailer" data-key="${trailer.key}">${TRAILER_BUTTON.play}</button>` : ""}
                    <button class="heart" aria-label="إضافة إلى المفضلة">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.4 5 6 5c2 0 3.4 1 4 2.2.6-1.2 2-2.2 4-2.2 3.6 0 5.4 3.4 4 6.7-2.5 4.7-10 9.3-10 9.3z"/></svg>
                    </button>
                </div>
                <p class="overview">${overview || "لا يوجد وصف متاح."}</p>
            </div>
        </div>`;
}

function createPersonDetails(person) {
    const department = DEPARTMENTS[person.known_for_department] || person.known_for_department;
    const place = person.place_of_birth || "غير معروف";
    const biography = person.biography || person.translations.translations.find((item) => item.iso_639_1 === "en")?.data.biography;
    return `
        <div class="details-main">
            <div class="details-poster">
                <img src="${getImageUrl(person.profile_path)}" alt="${person.name}">
            </div>
            <div class="details-info">
                <h2>${person.name}</h2>
                <p class="meta">
                    <span>${department}</span>
                    <span aria-hidden="true">•</span>
                    <span>${formatDate(person.birthday)}</span>
                    <span aria-hidden="true">•</span>
                    <span>${place}</span>
                </p>
                <p class="overview">${biography || "لا توجد سيرة متاحة."}</p>
            </div>
        </div>`;
}

function renderMovies(movies, type, append) {
    if (movies.length === 0 && !append) {
        showMessage("لا توجد نتائج.");
        return;
    }
    const createCard = type === "person" ? createPersonCard : createMovieCard;
    const cards = movies.map(createCard).join("");
    if (append) {
        moviesContainer.insertAdjacentHTML("beforeend", cards);
    } else {
        moviesContainer.innerHTML = cards;
    }
}
function setSectionHeader(title, hideTime) {
    sectionTitle.textContent = title;
    timeToggle.hidden = hideTime;
}

function showMessage(text) {
    moviesContainer.innerHTML = `<p class="message">${text}</p>`;
}

// API 
async function fetchFromTMDB(path) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(`${BASE_URL}${path}${separator}language=ar`);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
    return response.json();
}

async function loadMovies(path, type, page = 1) {
    if (page === 1) showMessage("جارٍ التحميل…");
    loadMoreButton.hidden = true;
    lastLoad = { path: path, type: type, page: page };
    const separator = path.includes("?") ? "&" : "?";
    try {
        const data = await fetchFromTMDB(`${path}${separator}page=${page}`);
        renderMovies(data.results, type, page > 1);
        loadMoreButton.hidden = data.page >= data.total_pages;
    } catch (error) {
        console.error(error);
        showMessage("حدث خطأ ما، يرجى المحاولة مرة أخرى.");
    }
}


function getTrending(type, time) {
    loadMovies(`/trending/${type}/${time}`, type);
}

function getSearch(type, query) {
    loadMovies(`/search/${type}?query=${encodeURIComponent(query)}`, type);
}

async function openDetails(type, id, lang) {
    const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=videos,translations&include_video_language=${lang}`);    const createDetails = type === "person" ? createPersonDetails : createMovieDetails;
    detailsContent.innerHTML = createDetails(data);

    detailsDialog.showModal();
}

getTrending(currentType, currentTime);