import { fetchFromTMDB } from "./api.js";
import { getImageUrl, formatDate, formatRating, DEPARTMENTS, ARABIC } from "./render.js";

// Config
const TRAILER_BUTTON = {
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>شاهد الإعلان`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>إغلاق الإعلان`,
};

const RELEASE_TYPES = {
    1: "العرض الأول",
    2: "السينما (عرض محدود)",
    3: "السينما",
    4: "المنصّات الرقمية",
    5: "الأقراص",
    6: "التلفزيون",
};
const LOGO_URL = "https://image.tmdb.org/t/p/w92";
const REGION = (navigator.language.split("-")[1] || "SA").toUpperCase();

// Elements
const detailsDialog = document.getElementById("details");
const closeDetailsButton = document.getElementById("closeDetails");
const detailsContent = document.getElementById("detailsContent");

// Events
document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (!card) return;
    openDetails(card.dataset.type, card.dataset.id, card.dataset.lang);
});

closeDetailsButton.addEventListener("click", () => {
    detailsDialog.close();
});

detailsDialog.addEventListener("click", (event) => {
    if (event.target === detailsDialog) detailsDialog.close();
});

detailsContent.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (!button) return;
    const player = detailsContent.querySelector(".player");
    if (player) {
        player.remove();
        button.innerHTML = TRAILER_BUTTON.play;
    } else {
        detailsContent.insertAdjacentHTML("beforeend", `<iframe class="player" src="https://www.youtube-nocookie.com/embed/${button.dataset.key}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`);
        button.innerHTML = TRAILER_BUTTON.close;
    }
});

detailsDialog.addEventListener("close", () => {
    detailsContent.innerHTML = "";
});

// Templates
function createMovieDetails(movie) {
    const title = movie.title || movie.name;
    const date = movie.release_date || movie.first_air_date;
    const year = date ? Number(date.slice(0, 4)).toLocaleString("ar-EG", { useGrouping: false }) : "غير معروف";
    const hours = Math.floor(movie.runtime / 60).toLocaleString("ar-EG");
    const minutes = (movie.runtime % 60).toLocaleString("ar-EG");
    const length = movie.number_of_seasons ? `المواسم: ${movie.number_of_seasons.toLocaleString("ar-EG")}` : `${hours} س ${minutes} د`;
    const genres = movie.genres.map((genre) => `<span class="genre">${genre.name}</span>`).join("");
    const trailer = movie.videos.results.find((video) => video.site === "YouTube" && video.type === "Trailer");
    const overview = movie.overview || movie.translations.translations.find((item) => item.iso_639_1 === "en")?.data.overview;
    const watch = movie["watch/providers"]?.results;
    const providers = (watch?.[REGION] || watch?.SA || watch?.US)?.flatrate || [];
    const countries = movie.release_dates?.results || [];
    const country = countries.find((item) => item.iso_3166_1 === REGION) || countries.find((item) => item.iso_3166_1 === "SA") || countries.find((item) => item.iso_3166_1 === "US");
    const releases = (country?.release_dates || []).filter((release) => new Date(release.release_date) > new Date());
    const releasesList = releases.map((release) => `<span class="genre">${RELEASE_TYPES[release.type]}: ${formatDate(release.release_date)}</span>`).join("");
    const providersList = providers.map((provider) => `<span class="provider"><img src="${LOGO_URL}${provider.logo_path}" alt="">${provider.provider_name}</span>`).join("");

    return `
        <div class="details-main">
            <div class="details-poster">
                <img src="${getImageUrl(movie.poster_path)}" alt="${title}">
            </div>
            <div class="details-info">
                <h2 ${ARABIC.test(title) ? "" : 'lang="en"'}>${title}</h2>
                ${movie.tagline ? `<p class="tagline">${movie.tagline}</p>` : ""}
                <p class="meta">
                    <span class="score"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6z"/></svg>${formatRating(movie.vote_average)}</span>
                    <span aria-hidden="true">•</span>
                    <span>${year}</span>
                    <span aria-hidden="true">•</span>
                    <span>${length}</span>
                </p>
                <div class="genres">${genres}</div>
                <div class="actions">
                    ${trailer ? `<button class="btn btn-primary trailer" data-key="${trailer.key}">${TRAILER_BUTTON.play}</button>` : ""}
                    <button class="heart" aria-label="إضافة إلى المفضلة">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.4 5 6 5c2 0 3.4 1 4 2.2.6-1.2 2-2.2 4-2.2 3.6 0 5.4 3.4 4 6.7-2.5 4.7-10 9.3-10 9.3z"/></svg>
                    </button>
                </div>
                <p class="overview">${overview || "لا يوجد وصف متاح."}</p>
                ${releases.length ? `
                    <div class="watch">
                        <h3>موعد النزول</h3>
                        <div class="providers">${releasesList}</div>
                    </div>` : ""}
                ${providers.length ? `
                    <div class="watch">
                        <h3>متوفر على</h3>
                        <div class="providers">${providersList}</div>
                        <p class="source">المصدر: JustWatch</p>
                    </div>` : ""}
            </div>
        </div>`;
}

function createPersonDetails(person) {
    const department = DEPARTMENTS[person.known_for_department] || person.known_for_department;
    const place = person.place_of_birth || "غير معروف";
    const biography = person.biography || person.translations.translations.find((item) => item.iso_639_1 === "en")?.data.biography;
    return `
        <div class="details-main">
            <div class="details-poster">
                <img src="${getImageUrl(person.profile_path)}" alt="${person.name}">
            </div>
            <div class="details-info">
                <h2>${person.name}</h2>
                <p class="meta">
                    <span>${department}</span>
                    <span aria-hidden="true">•</span>
                    <span>${formatDate(person.birthday)}</span>
                    <span aria-hidden="true">•</span>
                    <span>${place}</span>
                </p>
                <p class="overview">${biography || "لا توجد سيرة متاحة."}</p>
            </div>
        </div>`;
}

// Open
async function openDetails(type, id, lang) {
    const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=videos,translations,release_dates,watch/providers&include_video_language=${lang}`);    const createDetails = type === "person" ? createPersonDetails : createMovieDetails;
    detailsContent.innerHTML = createDetails(data);
    detailsDialog.showModal();
}
