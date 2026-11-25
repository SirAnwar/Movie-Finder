const NETWORK_ERROR = "تعذّر الاتصال بالخادم، تحقّق من اتصالك بالإنترنت";
const GENERIC_ERROR = "حدث خطأ، يرجى المحاولة مرة أخرى";

// Talk to our Express API (/api/...) and return the JSON reply.
// Throws an Error with the server's Arabic message when something goes wrong.
export async function apiRequest(path, method = "GET", body) {
    let response;
    try {
        response = await fetch(`/api${path}`, {
            method,
            headers: body ? { "Content-Type": "application/json" } : {},
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error(NETWORK_ERROR);
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
        } finally {
            button.disabled = false;
            button.textContent = buttonText;
        }
    });
}
