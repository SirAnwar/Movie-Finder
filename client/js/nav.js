import "./session.js";

// Elements
const navbar = document.querySelector("header");
const navLinks = navbar.querySelector("nav");

// Mobile bottom bar: a copy of the top links, placed outside the header,
// so hiding the header never hides the bottom bar (iOS stops drawing what's inside an off-screen header)
const bottomNav = navLinks.cloneNode(true);
bottomNav.className = "bottom-nav";
bottomNav.querySelector("details").removeAttribute("id");
document.body.append(bottomNav);

const menus = document.querySelectorAll("nav details");

// State
let lastScroll = window.scrollY;

// Close the movies menu when clicking outside it
document.addEventListener("click", (event) => {
    menus.forEach((menu) => {
        if (!menu.contains(event.target)) menu.open = false;
    });
});

// Hide the top bar when scrolling down, show it when scrolling up (styled on mobile only)
window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    if (Math.abs(scroll - lastScroll) < 10) return;
    navbar.classList.toggle("navbar-hidden", scroll > lastScroll && scroll > 80);
    lastScroll = scroll;
}, { passive: true });
