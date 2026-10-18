// Config
const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZmRhMTc3MDhlMjI2NTBjN2I4MDI0ODY0YjkxZjNmMyIsIm5iZiI6MTc4OTQ5MDgyOC4xNjQsInN1YiI6IjZhYTk3NjhjMTk1ZTQwNzMyYmQzZmFkMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._vnlOawoTyZolx9S3oD3DE3Lw66XmwYEMHGILtQM-LI";
const BASE_URL = "https://api.themoviedb.org/3";
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

// State 
let currentType = "movie";
let currentTime = "day";

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
        searchInput.placeholder = PLACEHOLDERS[currentType];
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

// Render
function getRatingClass(score) {
    if (score >= 7) return "high";
    if (score >= 5) return "mid";
    return "low";
}
function formatDate(dateString) {
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
                <article class="movie">
                    <div class="poster">
                        <img src="${IMAGE_URL}${movie.poster_path}" alt="${title}">
                        <span class="rating ${ratingClass}">${rating}</span>
                    </div>
                    <h3>${title}</h3>
                    <p>${formatDate(date)}</p>
                </article>`
}
function createPersonCard(person) {
    return `
                <article class="movie">
                    <div class="poster">
                        <img src="${IMAGE_URL}${person.profile_path}" alt="${person.name}">
                    </div>
                    <h3>${person.name}</h3>
                    <p>${person.known_for_department}</p>
                </article>`;
}
function renderMovies(movies, type) {
    if (type === "person") {
        moviesContainer.innerHTML = movies.map(createPersonCard).join("");
    } else {
        moviesContainer.innerHTML = movies.map(createMovieCard).join("");
    }
}
function setSectionHeader(title, hideTime) {
    sectionTitle.textContent = title;
    timeToggle.hidden = hideTime;
}


// API 
async function fetchFromTMDB(path) {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            authorization: `Bearer ${API_TOKEN}`,
        },
    });
    return response.json();
}

async function getTrending(type, time) {
    const data = await fetchFromTMDB(`/trending/${type}/${time}`);
    renderMovies(data.results, type);
}

async function getCategory(type, category) {
    const data = await fetchFromTMDB(`/${type}/${category}`);
    renderMovies(data.results, type);
}
getTrending(currentType, currentTime);