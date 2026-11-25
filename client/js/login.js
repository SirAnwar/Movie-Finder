import { apiRequest, handleSubmit } from "./auth-api.js";
import "./nav.js";

// Elements
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = loginForm.querySelector(".toggle-password");

// Show / hide the password
togglePassword.addEventListener("click", () => {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    togglePassword.setAttribute("aria-label", show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور");
});

// Log in
handleSubmit(loginForm, "جارٍ تسجيل الدخول…", async () => {
    await apiRequest("/auth/login", "POST", {
        email: loginForm.email.value,
        password: passwordInput.value,
    });
    window.location.href = "/";
});
