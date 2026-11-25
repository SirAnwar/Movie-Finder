import { apiRequest, handleSubmit } from "./auth-api.js";
import "./nav.js";

// Elements
const forgotStep = document.getElementById("forgotStep");
const sentStep = document.getElementById("sentStep");
const forgotForm = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const resendButton = document.getElementById("resendButton");

function sendLink() {
    return apiRequest("/auth/forgot-password", "POST", { email: emailInput.value });
}

// First send: show the "check your email" state
handleSubmit(forgotForm, "جارٍ الإرسال…", async () => {
    await sendLink();
    forgotStep.hidden = true;
    sentStep.hidden = false;
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
