// Config
const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZmRhMTc3MDhlMjI2NTBjN2I4MDI0ODY0YjkxZjNmMyIsIm5iZiI6MTc4OTQ5MDgyOC4xNjQsInN1YiI6IjZhYTk3NjhjMTk1ZTQwNzMyYmQzZmFkMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._vnlOawoTyZolx9S3oD3DE3Lw66XmwYEMHGILtQM-LI";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

// Elements 
const menuLinks = document.querySelectorAll(".nav-item:has(.submenu) > a");
const menuToggle = document.getElementById("menuToggle");
const navSearch = document.getElementById("navSearch");
const searchInput = document.getElementById("searchInput");
const moviesContainer = document.getElementById("movies");
const timeButtons = document.querySelectorAll("[data-time]");

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
        getTrending(button.dataset.time);
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
    const rating = movie.vote_average.toFixed(1);
    const ratingClass = getRatingClass(movie.vote_average);
    return `
                <article class="movie">
                    <div class="poster">
                        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
                        <span class="rating ${ratingClass}">${rating}</span>
                    </div>
                    <h3>${movie.title}</h3>
                    <p>${formatDate(movie.release_date)}</p>
                </article>`
}
function renderMovies(movies) {
    moviesContainer.innerHTML = movies.map(createMovieCard).join("");
}


// API 
async function getTrending(time) {
    const response = await fetch(`${BASE_URL}/trending/movie/${time}`, {
        headers: {
            authorization: `Bearer ${API_TOKEN}`,
        },
    });
    const data = await response.json();
    renderMovies(data.results);
}
getTrending("day");