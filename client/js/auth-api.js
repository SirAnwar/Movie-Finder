import { createIcon } from "./icons.js";

const NETWORK_ERROR = "تعذّر الاتصال بالخادم، تحقّق من اتصالك بالإنترنت";
const GENERIC_ERROR = "حدث خطأ، يرجى المحاولة مرة أخرى";
const WAKE_DELAY = 3000;
const SPINNER_ICON = "M21 12a9 9 0 1 1-9-9";

let pendingRequests = 0;
let wakeTimer;
let wakeNotice; // built on the first use, then reused

// The free server sleeps when idle; the first request can take about a minute
function showWakeNotice() {
    if (!wakeNotice) {
        wakeNotice = document.createElement("div");
        wakeNotice.className = "wake-notice";
        wakeNotice.setAttribute("role", "status");

        const text = document.createElement("span");
        text.textContent = "جارٍ الاتصال بالخادم، قد يستغرق ذلك دقيقة في المرة الأولى…";

        wakeNotice.append(createIcon(SPINNER_ICON), text);
        document.body.append(wakeNotice);
    }
    wakeNotice.hidden = false;
}

// Talk to our Express API (/api/...) and return the JSON reply.
// Throws an Error with the server's Arabic message when something goes wrong.
export async function apiRequest(path, method = "GET", body) {
    let response;
    pendingRequests++;
    if (pendingRequests === 1) wakeTimer = setTimeout(showWakeNotice, WAKE_DELAY);
    try {
        response = await fetch(`/api${path}`, {
            method,
            headers: body ? { "Content-Type": "application/json" } : {},
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error(NETWORK_ERROR);
    } finally {
        pendingRequests--;
        if (pendingRequests === 0) {
            clearTimeout(wakeTimer);
            if (wakeNotice) wakeNotice.hidden = true;
        }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.message || GENERIC_ERROR);
        error.status = response.status;
        throw error;
    }
    return data;
}

// Shared submit flow for the auth forms:
// hide the old error, show a loading button, run the page's action, show any error
export function handleSubmit(form, loadingText, action) {
    const button = form.querySelector('button[type="submit"]');
    const formError = form.querySelector(".form-error");
    const buttonText = button.textContent;

    // Typing again clears the red borders
    form.addEventListener("input", () => form.classList.remove("has-error"));

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        formError.hidden = true;
        button.disabled = true;
        button.textContent = loadingText;

        try {
            await action();
        } catch (error) {
            formError.textContent = error.message;
            formError.hidden = false;
            form.classList.add("has-error");
        } finally {
            button.disabled = false;
            button.textContent = buttonText;
        }
    });
}
