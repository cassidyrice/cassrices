# Cassrices

Animated explainer videos for Flathead Valley businesses, by Cassidy Lee Rice. The lead offer is a free 15-second sample made in the business's own brand colors; full 30–60 s videos are $156 each or 3 for $390.

Site: <https://cassrices.com>

## Layout

- `index.html` – the landing page (hero, how it works, brand colors, who it's for, pricing, FAQ, request form)
- `thanks/` – no-JS confirmation page after a form post
- `quote/` – the old instant job-quote tool (unlinked, `noindex`; rates in `assets/js/pricing.js`)
- `functions/api/sample-request.js` – Pages Function that stores free-sample requests in KV
- `assets/` – CSS, JS, self-hosted Space Grotesk + Inter (OFL), example stills, OG image

Rollback: tag `pre-video-offer` is the last commit of the quote-tool site.

## Form submissions

Stored in the Workers KV namespace `cassrices-sample-requests` (id `376aced1bcc64852b3577532509b38c3`, binding `SAMPLE_REQUESTS` in `wrangler.toml`). Keys look like `req:<ISO time>:<uuid>`; values are JSON with business, website, email, topic. Keys `rl:<ip>` are 60-second throttle markers and expire on their own.

Read them in the Cloudflare dashboard (Storage & Databases → KV → cassrices-sample-requests), or:

```sh
npx wrangler kv key list --namespace-id 376aced1bcc64852b3577532509b38c3 --prefix req: --remote
npx wrangler kv key get --namespace-id 376aced1bcc64852b3577532509b38c3 --remote "req:…"
```

## Run locally

```sh
mkdir -p _site && cp index.html _headers robots.txt sitemap.xml CNAME .nojekyll manifest.webmanifest _site/ && cp -R assets quote thanks _site/
npx wrangler pages dev _site
```

## Checks

```sh
node tests/pricing.test.js
```

## Deploy

Push to `main`. `.github/workflows/deploy-cloudflare.yml` assembles `_site` and runs `wrangler pages deploy` (which also bundles `./functions` and reads the KV binding from `wrangler.toml`). There is no `package.json` and no build command; do not add `npm ci` / `npm run build`.
