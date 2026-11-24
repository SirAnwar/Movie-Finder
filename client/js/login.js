import { apiRequest } from "./auth-api.js";
import "./nav.js";

// Elements
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = loginForm.querySelector(".toggle-password");
const submitButton = loginForm.querySelector('button[type="submit"]');
const formError = document.getElementById("formError");

// Show / hide the password
togglePassword.addEventListener("click", () => {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    togglePassword.setAttribute("aria-label", show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور");
});

// Log in
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = "جارٍ تسجيل الدخول…";

    try {
        await apiRequest("/auth/login", "POST", {
            email: loginForm.email.value,
            password: passwordInput.value,
        });
        window.location.href = "/";
    } catch (error) {
        formError.textContent = error.message;
        formError.hidden = false;
        submitButton.disabled = false;
        submitButton.textContent = "تسجيل الدخول";
    }
});
