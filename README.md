# Ankit Deo — Portfolio

My personal developer portfolio, built with plain HTML, CSS and JavaScript so it can be hosted for free on GitHub Pages.

## Live sections

- **Home** — introduction and quick links
- **About** — a short bio
- **Skills** — languages, frameworks and tools
- **Projects** — pulled dynamically so new work can be added over time
- **GitHub** — live stats and top repositories, pulled from the public GitHub API
- **Contact** — a message form

## Running locally

No build step needed. Just open `index.html` in a browser, or serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Deploying to GitHub Pages

1. Create a repository named `<your-github-username>.github.io`
2. Push these files to the `main` branch
3. In the repo's **Settings → Pages**, set the source to the `main` branch, root folder
4. Your site will be live at `https://<your-github-username>.github.io`

## Connecting Supabase (optional)

By default, project data lives in the visitor's browser (localStorage). To make project updates visible to everyone, connect Supabase:

1. Create a free project at [supabase.com](https://supabase.com)
2. Create a `projects` table with columns: `id`, `title`, `description`, `tags`, `link`, `github`, `created_at`
3. Open `js/supabase-client.js` and fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`, then set `USE_SUPABASE = true`
4. Add this to the `<head>` of `index.html` and `admin.html`, above the other scripts:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

That's the only change needed — the rest of the site already reads and writes through `js/data.js`, which will automatically start using Supabase once it's connected.

## Project structure

```
├── index.html          Main site
├── admin.html           Project management dashboard
├── css/style.css        Styles
├── js/data.js            Project data layer (localStorage / Supabase)
├── js/supabase-client.js Supabase connection template
├── js/app.js             Site behavior (nav, form, GitHub stats)
└── js/admin.js           Admin dashboard behavior
```

## Tech stack

HTML, CSS, JavaScript, GitHub REST API, [devicon](https://devicon.dev/) for skill icons. Ready to connect to [Supabase](https://supabase.com) for persistent project storage.
