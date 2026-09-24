# Deploy cassrices.com

Production host for the job-quote tool is **Cloudflare Pages**, project name `cassrices`. A push to `main` or `tool/job-quote` publishes that build as the Pages **production** branch (`main`) and replaces whatever was previously deployed to the project.

## What is live today

Checked 2026-09-24:

| Check | Result |
| --- | --- |
| Nameservers | `kayleigh.ns.cloudflare.com`, `kip.ns.cloudflare.com` |
| Apex and www | Cloudflare proxy addresses (`104.21.*`, `172.67.*`). www returns `308` to `https://cassrices.com/`. |
| Response | `server: cloudflare`, `cache-control: public, max-age=0, must-revalidate` (Pages-style). HTML is a one-page “Cass Rice” profile, not this repo’s Jekyll ship log. |
| This repo | `CNAME` is `cassrices.com`. `.github/workflows/pages.yml` builds Jekyll and deploys GitHub Pages. That workflow last succeeded on 2026-05-17. `https://cassidyrice.github.io/cassrices/` redirects to `http://cassrices.com/`. |
| Cloudflare API account `d6738f0bb7430087c3521743aea75251` (`Cassidyricecompany@gmail.com's Account`) | Token can list the account. **Zones: none. Pages projects: none. Workers: none.** The zone `cassrices.com` is on Cloudflare, but not in this account. |

GitHub Pages is configured for the domain. It is not what visitors currently receive. The live page is served from another Cloudflare account.

## Secrets (do not commit)

Add these on the GitHub repo (`Settings → Secrets and variables → Actions`):

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Custom token for the account that **owns the zone `cassrices.com`**. Permissions: Account `Cloudflare Pages: Edit`, Zone `DNS: Edit` on `cassrices.com`. |
| `CLOUDFLARE_ACCOUNT_ID` | Account id of that same account (the one that lists zone `cassrices.com`). |

The token available to this agent is not that token. Do not reuse account `d6738f0bb7430087c3521743aea75251` until `cassrices.com` is added to it.

## How production updates

1. The job-quote app is a static site on `tool/job-quote` (or merged to `main`). `index.html` and `assets/` live at the repo root. There is no `package.json` and no build command.
2. Push that branch, or merge to `main`. Workflow: **Deploy quote tool to Cloudflare Pages**.
3. The workflow copies the static root into `_site` (`index.html`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `assets/`) and uploads it as-is:

   ```sh
   npx wrangler pages deploy _site --project-name=cassrices --branch=main
   ```

   `--branch=main` is the Pages production branch, including when the git branch is `tool/job-quote`. That upload is the production artifact. Cloudflare Pages project settings, if created in the dashboard instead, are publish directory `/` and an empty build command.

4. First-time custom domain (one time, after the secrets above exist). Run the workflow manually with **attach domains** checked. That calls the Pages domains API, which writes the proxied DNS records in the zone. It fails if the token’s account does not own `cassrices.com`. The same calls by hand:

   ```sh
   # CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must already be set in the environment.
   curl -sS -X POST \
     "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/cassrices/domains" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"name":"cassrices.com"}'

   curl -sS -X POST \
     "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/cassrices/domains" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"name":"www.cassrices.com"}'
   ```

   Wrangler 4 has no `pages domain` subcommand. Direct upload (`pages deploy`) still creates the project on first deploy.

5. After both hostnames show the quote tool, delete the repo `CNAME` file so GitHub Pages stops claiming `cassrices.com`. On this branch, `.github/workflows/pages.yml` is manual-only. The app branch `tool/job-quote` still has a GitHub Pages workflow that publishes the same static root; Cloudflare Pages is the production cutover.

## Verify

```sh
curl -sI https://cassrices.com
curl -sL https://cassrices.com | head
curl -sI https://www.cassrices.com
```

Pass when:

- `https://cassrices.com` returns the quote tool `index.html` (the job form), not the “Cass Rice / More coming soon” page and not the Jekyll ship log.
- `https://www.cassrices.com` either serves that same app or redirects to the apex, and the final page is the quote tool.
- Cloudflare dashboard → Workers & Pages → `cassrices` → Custom domains lists `cassrices.com` and `www.cassrices.com` as active.
- A hard refresh (or `curl` without cache) matches the latest Actions deploy for **Deploy quote tool to Cloudflare Pages**.

## Blocker

Live cutover cannot be finished until Cass adds a Cloudflare API token whose account contains the zone `cassrices.com`, plus `CLOUDFLARE_ACCOUNT_ID` for that account, as the two GitHub Actions secrets above. No DNS records were changed.
