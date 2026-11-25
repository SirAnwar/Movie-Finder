import { createIcon } from "./session.js";

const CHECK_ICON = "M20 6 9 17l-5-5";
const CROSS_ICON = "M18 6 6 18M6 6l12 12";

let toast; // built on the first use, then reused
let hideTimer;

// Small cream message at the bottom. tone: "good" (green check) or "danger" (red cross)
export function showToast(message, tone = "good") {
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.append(toast);
    }

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.append(createIcon(tone === "good" ? CHECK_ICON : CROSS_ICON));

    const text = document.createElement("span");
    text.textContent = message;

    toast.replaceChildren(icon, text);
    toast.dataset.tone = tone;
    toast.classList.add("is-visible");

    // A new message restarts the timer
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
}
