# Cassrices

Mobile-first instant quotes for lawn care, house cleaning, and handyman visits. The visitor answers three short questions, sees a price, and can text or email the request.

Site: <https://cassrices.com>

## Run locally

No build step. From the repo root:

```sh
python3 -m http.server 4173
```

Open <http://127.0.0.1:4173> and narrow the window to a phone width (about 390×844).

Path: land → pick a service → answer three questions → read the quote → enter name, mobile, ZIP, and a time window → text, email, or copy the request.

Requests stay in this browser (`sessionStorage`) until a booking inbox is connected. Edit rates and questions in `assets/js/pricing.js`.

## Checks

```sh
node tests/pricing.test.js
```

## Deploy

Static files at the repository root. Publish directory is `/`. Build command is empty.

Included for the platform:

- `index.html` — app
- `assets/` — CSS, JS, icon
- `CNAME` — `cassrices.com`
- `.nojekyll` — skip Jekyll if a host would otherwise run it

GitHub Pages still deploys from `main` via `.github/workflows/pages.yml`, which copies this root into the Pages artifact.
