import { apiRequest } from "./auth-api.js";
import { sessionReady } from "./session.js";

// One key per saved title: type + TMDB id, e.g. "movie:550"
export function favoriteKey(type, id) {
    return `${type}:${id}`;
}

// Load the user's saved keys once (an empty set for guests)
async function loadSavedKeys() {
    const user = await sessionReady;
    if (!user) return new Set();

    try {
        const favorites = await apiRequest("/favorites");
        return new Set(favorites.map((favorite) => favoriteKey(favorite.type, favorite.tmdbId)));
    } catch {
        return new Set();
    }
}

// Other files can `await savedKeysReady` to get the set
export const savedKeysReady = loadSavedKeys();

// Show a heart as saved or not (fill + label for screen readers)
export function setHeartState(heart, saved) {
    heart.classList.toggle("is-saved", saved);
    heart.setAttribute("aria-label", saved ? "إزالة من المفضّلة" : "إضافة إلى المفضّلة");
}

// Fill the hearts of saved titles inside a container
export async function markSavedHearts(container) {
    const savedKeys = await savedKeysReady;
    for (const heart of container.querySelectorAll(".movie .heart")) {
        const card = heart.closest(".movie");
        setHeartState(heart, savedKeys.has(favoriteKey(card.dataset.type, card.dataset.id)));
    }
}

let loginPrompt; // built on the first use, then reused

// Small cream dialog for guests who click a heart
function showLoginPrompt() {
    if (!loginPrompt) {
        loginPrompt = document.createElement("dialog");
        loginPrompt.className = "login-prompt";
        loginPrompt.setAttribute("aria-labelledby", "loginPromptTitle");

        const box = document.createElement("div");
        box.className = "login-prompt-box";

        const title = document.createElement("h2");
        title.id = "loginPromptTitle";
        title.textContent = "يجب تسجيل الدخول أولًا";

        const text = document.createElement("p");
        text.textContent = "لحفظ الأفلام في المفضّلة، يرجى تسجيل الدخول أو إنشاء حساب جديد.";

        const loginLink = document.createElement("a");
        loginLink.href = "/pages/login.html";
        loginLink.className = "prompt-button";
        loginLink.textContent = "تسجيل الدخول";

        const signupLink = document.createElement("a");
        signupLink.href = "/pages/signup.html";
        signupLink.className = "prompt-button prompt-button-ghost";
        signupLink.textContent = "إنشاء حساب";

        const actions = document.createElement("div");
        actions.className = "login-prompt-actions";
        actions.append(loginLink, signupLink);

        box.append(title, text, actions);
        loginPrompt.append(box);

        // A click on the dark backdrop closes it
        loginPrompt.addEventListener("click", (event) => {
            if (event.target === loginPrompt) loginPrompt.close();
        });

        document.body.append(loginPrompt);
    }
    loginPrompt.showModal();
}

// Heart clicks on any card (cards are re-drawn, so listen on the whole page)
document.addEventListener("click", async (event) => {
    const heart = event.target.closest(".movie .heart");
    if (!heart) return;

    const user = await sessionReady;
    if (!user) {
        showLoginPrompt();
        return;
    }
    console.log("toggle favorite"); // next step replaces this
});
