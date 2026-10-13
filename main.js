// Config
const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZmRhMTc3MDhlMjI2NTBjN2I4MDI0ODY0YjkxZjNmMyIsIm5iZiI6MTc4OTQ5MDgyOC4xNjQsInN1YiI6IjZhYTk3NjhjMTk1ZTQwNzMyYmQzZmFkMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._vnlOawoTyZolx9S3oD3DE3Lw66XmwYEMHGILtQM-LI";
const BASE_URL = "https://api.themoviedb.org/3";

// Elements 
const menuLinks = document.querySelectorAll(".nav-item:has(.submenu) > a");
const menuToggle = document.getElementById("menuToggle");
const navSearch = document.getElementById("navSearch");
const searchInput = document.getElementById("searchInput");

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


// API 
async function getTrending() {
    const response = await fetch(`${BASE_URL}/trending/movie/day`,{
        headers: {
            authorization: `Bearer ${API_TOKEN}`,
        },
    });
    const data = await response.json();
    console.log(data);
    
}
getTrending();