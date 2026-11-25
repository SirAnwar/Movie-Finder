import { apiRequest, handleSubmit } from "./auth-api.js";
import "./nav.js";

// Elements
const signupForm = document.getElementById("signupForm");

// Create the account (the server logs the user in right away)
handleSubmit(signupForm, "جارٍ إنشاء الحساب…", async () => {
    await apiRequest("/auth/register", "POST", {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    });
    window.location.href = "/";
});
