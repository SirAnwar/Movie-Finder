// Elements 
const menuLinks = document.querySelectorAll(".nav-item:has(.submenu) > a");

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