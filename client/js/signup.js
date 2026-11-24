import { apiRequest } from "./auth-api.js";
import "./nav.js";

// Elements
const signupForm = document.getElementById("signupForm");
const submitButton = signupForm.querySelector('button[type="submit"]');
const formError = document.getElementById("formError");

// Create the account (the server logs the user in right away)
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = "جارٍ إنشاء الحساب…";

    try {
        await apiRequest("/auth/register", "POST", {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
        });
        window.location.href = "/";
    } catch (error) {
        formError.textContent = error.message;
        formError.hidden = false;
        submitButton.disabled = false;
        submitButton.textContent = "إنشاء حساب";
    }
});
