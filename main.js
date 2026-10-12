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