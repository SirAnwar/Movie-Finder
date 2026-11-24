import { apiRequest } from "./auth-api.js";
import "./nav.js";

// Elements
const resetStep = document.getElementById("resetStep");
const doneStep = document.getElementById("doneStep");
const expiredStep = document.getElementById("expiredStep");
const resetForm = document.getElementById("resetForm");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const submitButton = resetForm.querySelector('button[type="submit"]');
const formError = document.getElementById("formError");

// The token comes from the email link: reset-password.html?token=...
const token = new URLSearchParams(window.location.search).get("token");

// Show one of the three states and hide the others
function showStep(step) {
    for (const s of [resetStep, doneStep, expiredStep]) {
        s.hidden = s !== step;
    }
}

function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
}

// Opened without a token: nothing to reset
if (!token) showStep(expiredStep);

resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.hidden = true;

    if (passwordInput.value !== confirmInput.value) {
        showError("كلمتا المرور غير متطابقتين.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "جارٍ التغيير…";

    try {
        await apiRequest("/auth/reset-password", "POST", { token, password: passwordInput.value });
        showStep(doneStep);
    } catch (error) {
        if (error.status === 400) showStep(expiredStep);
        else showError(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "تغيير كلمة المرور";
    }
});
