// Config
const BASE_URL = "/api";

// API
export async function fetchFromTMDB(path) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await fetch(`${BASE_URL}${path}${separator}language=ar`);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
    return response.json();
}
