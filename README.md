# Movie Finder

A movie discovery website built with vanilla JavaScript and the TMDB API. Browse trending movies, TV shows and people, filter by category (Popular, Top Rated, Upcoming), and search by title.

**Live demo:** https://anwar-movie-finder.netlify.app <img width="2880" height="1800" alt="Screenshot (869)" src="https://github.com/user-attachments/assets/5fabe9e7-1896-4938-982e-84f1c2a1c1f1" />
<img width="2880" height="1800" alt="Screenshot (882)" src="https://github.com/user-attachments/assets/85774536-16a7-4a19-bdd3-59505815346a" />


## Features
- Trending (Today / This Week), categories and search, with "Load more" pagination
- Details modal with poster, rating, genres and a YouTube trailer
- Loading, empty-results and error states, plus image fallbacks
- Responsive design, tested on desktop and iPhone Safari
- API key kept secret behind a Netlify serverless function

## What I learned
- Front-end is more than coding: I planned the layout, colors and user flow before writing any code
- Working with a real REST API: reading its responses and building the UI around the data
- Keeping secrets safe: moving the API key to a server-side proxy and regenerating a leaked key
- Deploying with Netlify: environment variables, serverless functions and automatic deploys on every push
- Debugging: reading console errors and tracing them back to the root cause
- Checking real data before building on it, instead of relying on assumptions
- Writing reusable code and refactoring repeated logic into shared functions
- Testing on real devices, which caught issues that only appeared in Safari on iPhone
- UX details: touch target sizes, familiar patterns users already know, and clear feedback while content loads

## Built with
HTML · CSS (Grid, Flexbox, nesting) · JavaScript (Fetch API, async/await, event delegation) · Netlify Functions · Git & GitHub
