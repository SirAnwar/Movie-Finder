export default async (request) => {
    const url = new URL(request.url);
    const path = url.pathname.replace("/api", "");
    const response = await fetch(`https://api.themoviedb.org/3${path}${url.search}`, {
        headers: {
            authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        },
    });
    return new Response(response.body, {
        status: response.status,
        headers: { "content-type": "application/json" },
    });
};

export const config = {
    path: "/api/*",
};
