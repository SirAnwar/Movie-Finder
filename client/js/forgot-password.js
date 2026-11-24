import { apiRequest } from "./auth-api.js";
import "./nav.js";

// Elements
const forgotStep = document.getElementById("forgotStep");
const sentStep = document.getElementById("sentStep");
const forgotForm = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const submitButton = forgotForm.querySelector('button[type="submit"]');
const formError = document.getElementById("formError");
const resendButton = document.getElementById("resendButton");

function sendLink() {
    return apiRequest("/auth/forgot-password", "POST", { email: emailInput.value });
}

// First send: show the "check your email" state
forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = "جارٍ الإرسال…";

    try {
        await sendLink();
        forgotStep.hidden = true;
        sentStep.hidden = false;
    } catch (error) {
        formError.textContent = error.message;
        formError.hidden = false;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "إرسال رابط إعادة التعيين";
    }
});

// Send again with the same email
resendButton.addEventListener("click", async () => {
    resendButton.disabled = true;
    resendButton.textContent = "جارٍ الإرسال…";

    try {
        await sendLink();
        resendButton.textContent = "تم إرسال الرابط مجددًا";
    } catch (error) {
        resendButton.textContent = error.message;
        resendButton.disabled = false;
    }
});
