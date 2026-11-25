import { apiRequest } from "./auth-api.js";

const authArea = document.querySelector(".auth");
const SVG_NS = "http://www.w3.org/2000/svg";
const HEART_ICON = "M12 21s-7.5-4.6-10-9.3C.6 8.4 2.4 5 6 5c2 0 3.4 1 4 2.2.6-1.2 2-2.2 4-2.2 3.6 0 5.4 3.4 4 6.7-2.5 4.7-10 9.3-10 9.3z";
const LOGOUT_ICON = "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9";

// Build an icon from a fixed path shape
function createIcon(pathData) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathData);

    svg.append(path);
    return svg;
}

// Cream pill: heart + "المفضّلة"
function createFavoritesLink() {
    const link = document.createElement("a");
    link.href = "/pages/favorites.html";
    link.className = "favorites-pill";
    link.append(createIcon(HEART_ICON), "المفضّلة");
    return link;
}

// Avatar circle (first letter) + name
function createUserChip(name) {
    const chip = document.createElement("div");
    chip.className = "user-chip";

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = name.charAt(0).toUpperCase();

    const userName = document.createElement("span");
    userName.className = "user-name";
    userName.textContent = name;

    chip.append(avatar, userName);
    return chip;
}

// Square button: log out, then reload the page as a guest
function createLogoutButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "logout-button";
    button.title = "تسجيل الخروج";
    button.setAttribute("aria-label", "تسجيل الخروج");
    button.append(createIcon(LOGOUT_ICON));

    button.addEventListener("click", async () => {
        button.disabled = true;
        try {
            await apiRequest("/auth/logout", "POST");
            window.location.reload();
        } catch {
            button.disabled = false;
        }
    });

    return button;
}

// Replace the guest buttons with the logged-in items
function showUser(user) {
    authArea.replaceChildren(createFavoritesLink(), createUserChip(user.name), createLogoutButton());
}

// Ask the server who is visiting, then show the right buttons
async function loadSession() {
    try {
        const user = await apiRequest("/auth/me");
        showUser(user);
    } catch {
        // Not logged in, or server unreachable: keep the guest buttons
    } finally {
        authArea.classList.add("is-ready");
    }
}

loadSession();
