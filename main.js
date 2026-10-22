// Config
const BASE_URL = "/api";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDERS = {
    movie: "Search for a movie...",
    tv: "Search for a TV show...",
    person: "Search for a person...",
};

// Elements 
const menuLinks = document.querySelectorAll(".nav-item:has(.submenu) > a");
const menuToggle = document.getElementById("menuToggle");
const navSearch = document.getElementById("navSearch");
const searchInput = document.getElementById("searchInput");
const moviesContainer = document.getElementById("movies");
const timeButtons = document.querySelectorAll("[data-time]");
const typeLinks = document.querySelectorAll("[data-type]");
const categoryLinks = document.querySelectorAll("[data-category]");
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

// Submenus
menuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const navItem = link.closest(".nav-item");
        document.querySelectorAll(".nav-item.open").forEach((item) => {
            if (item !== navItem) {
                item.classList.remove("open");
            }
        });
        navItem.classList.toggle("open");
    });
});

// Sidebar toggle
menuToggle.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-closed");
});

if (window.matchMedia("(max-width: 768px)").matches) {
    document.body.classList.add("sidebar-closed");
}

// Nav Search
navSearch.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 768px)").matches) {
        document.body.classList.add("sidebar-closed");
    }
    searchInput.scrollIntoView({ behavior: "smooth" });
    searchInput.focus({ preventScroll: true });
});

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
        currentType = link.dataset.type;
        searchInput.placeholder = PLACEHOLDERS[ currentType ];
        getTrending(currentType, currentTime);
        setSectionHeader("Trending", false);
    });
});

// Category links
categoryLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const typeLink = link.closest(".nav-item").querySelector("[data-type]");
        const type = typeLink.dataset.type;
        const category = link.dataset.category;
        getCategory(type, category);
        setSectionHeader(typeLink.textContent + " › " + link.textContent, true);
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
    openDetails(lastLoad.type, card.dataset.id);
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
    detailsContent.insertAdjacentHTML("afterbegin", `<iframe class="player" src="https://www.youtube-nocookie.com/embed/${button.dataset.key}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`);
    button.remove();
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
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}
function createMovieCard(movie) {
    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const rating = movie.vote_average.toFixed(1);
    const ratingClass = getRatingClass(movie.vote_average);
    return `
                <article class="movie" data-id="${movie.id}">
                    <div class="poster">
                        <img src="${getImageUrl(movie.poster_path)}" alt="${title}">
                        <span class="rating ${ratingClass}">${rating}</span>
                    </div>
                    <h3>${title}</h3>
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
                    <p>${person.known_for_department}</p>
                </article>`;
}

function createMovieDetails(movie) {
    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const year = date ? date.slice(0, 4) : "Unknown";
    const length = movie.number_of_seasons ? `${movie.number_of_seasons} seasons` : `${movie.runtime} min`;
    const genres = movie.genres.map((genre) => genre.name).join(", ");
    const trailer = movie.videos.results.find((video) => video.site === "YouTube" && video.type === "Trailer");

    return `
        <img src="${getImageUrl(movie.poster_path)}" alt="${title}">
        <div class="details-info">
            <h2>${title}</h2>
            ${movie.tagline ? `<p class="tagline">${movie.tagline}</p>` : ""}
            <p class="meta">⭐ ${movie.vote_average.toFixed(1)} • ${year} • ${length}</p>
            <p class="genres">${genres}</p>
                ${trailer ? `<button class="trailer" data-key="${trailer.key}">▶ Watch trailer</button>` : ""}
            <p>${movie.overview || "No overview available."}</p>
        </div>`;
}

function createPersonDetails(person) {
    const place = person.place_of_birth || "Unknown";
    return `
        <img src="${getImageUrl(person.profile_path)}" alt="${person.name}">
        <div class="details-info">
            <h2>${person.name}</h2>
            <p class="meta">${person.known_for_department}</p>
            <p class="meta">🎂 ${formatDate(person.birthday)} • ${place}</p>
            <p>${person.biography || "No biography available."}</p>
        </div>`;
}

function renderMovies(movies, type, append) {
    if (movies.length === 0 && !append) {
        showMessage("No results found.");
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
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
    return response.json();
}

async function loadMovies(path, type, page = 1) {
    if (page === 1) showMessage("Loading...");
    loadMoreButton.hidden = true;
    lastLoad = { path: path, type: type, page: page };
    const separator = path.includes("?") ? "&" : "?";
    try {
        const data = await fetchFromTMDB(`${path}${separator}page=${page}`);
        renderMovies(data.results, type, page > 1);
        loadMoreButton.hidden = data.page >= data.total_pages;
    } catch (error) {
        console.error(error);
        showMessage("Something went wrong. Please try again.");
    }
}


function getTrending(type, time) {
    loadMovies(`/trending/${type}/${time}`, type);
}

function getCategory(type, category) {
    loadMovies(`/${type}/${category}`, type);
}

function getSearch(type, query) {
    loadMovies(`/search/${type}?query=${encodeURIComponent(query)}`, type);
}

async function openDetails(type, id) {
    const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=videos`);
    const createDetails = type === "person" ? createPersonDetails : createMovieDetails;
    detailsContent.innerHTML = createDetails(data);

    detailsDialog.showModal();
}

getTrending(currentType, currentTime);