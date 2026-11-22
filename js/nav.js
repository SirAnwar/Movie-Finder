// Elements
const navMenu = document.getElementById("navMenu");

// Close the menu when clicking outside it
document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target)) navMenu.open = false;
});
