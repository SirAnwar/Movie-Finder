import { apiRequest } from "./auth-api.js";
import { sessionReady } from "./session.js";
import { showToast } from "./toast.js";

// One key per saved title: type + TMDB id, e.g. "movie:550"
export function favoriteKey(type, id) {
    return `${type}:${id}`;
}

// Data of every title drawn on the page, by key, so a heart click can save it
const pageItems = new Map();

export function rememberItem(type, item) {
    pageItems.set(favoriteKey(type, item.id), item);
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
    for (const heart of container.querySelectorAll(".heart")) {
        const card = heart.closest("[data-id]");
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

// Save or remove one title, then update its heart
async function toggleFavorite(heart) {
    const card = heart.closest("[data-id]"); // the card, or the heart itself in the details dialog
    const { type, id } = card.dataset;
    const key = favoriteKey(type, id);
    const savedKeys = await savedKeysReady;
    const saved = savedKeys.has(key);

    heart.disabled = true;
    try {
        if (saved) {
            await apiRequest(`/favorites/${type}/${id}`, "DELETE");
            savedKeys.delete(key);
        } else {
            const item = pageItems.get(key);
            await apiRequest("/favorites", "POST", {
                tmdbId: item.id,
                type,
                title: item.title || item.name,
                originalTitle: item.original_title || item.original_name,
                originalLanguage: item.original_language,
                posterPath: item.poster_path,
                date: item.release_date || item.first_air_date,
                rating: item.vote_average,
            });
            savedKeys.add(key);
        }
        markSavedHearts(document); // every heart for this title: card + details dialog
        showToast(saved ? "تمت إزالة الفيلم من المفضّلة" : "تمت إضافة الفيلم إلى المفضّلة", saved ? "danger" : "good");

        // Tell the page (the favorites page removes the card)
        document.dispatchEvent(new CustomEvent("favorite-change", { detail: { type, id, saved: !saved } }));
    } catch (error) {
        showToast(error.message, "danger");
    } finally {
        heart.disabled = false;
    }
}

// Heart clicks on any card (cards are re-drawn, so listen on the whole page)
document.addEventListener("click", async (event) => {
    const heart = event.target.closest(".heart");
    if (!heart) return;

    const user = await sessionReady;
    if (!user) {
        showLoginPrompt();
        return;
    }
    toggleFavorite(heart);
});
