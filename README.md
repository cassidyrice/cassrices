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

Static files at the repository root. There is no `package.json` and no build command.

GitHub Pages (`.github/workflows/pages.yml`) and Cloudflare Pages (`.github/workflows/deploy-cloudflare.yml`) both copy this root into `_site` and publish that directory.

Cloudflare cutover still needs GitHub Actions secrets on the account that owns the `cassrices.com` zone:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Do not merge a workflow that runs `npm ci` or `npm run build`. That path fails on this app.
