# Cassrices

Public ship log for completed projects.

Site: <https://cassrices.com>

## Add a shipped project

Copy the template:

```sh
cp templates/project-post.md _posts/YYYY-MM-DD-project-slug.md
```

Fill in:

- title
- description
- date
- status
- stack
- demo/repo links when available
- what shipped
- next version

## Local structure

```text
_posts/                  shipped project posts
_layouts/                Jekyll layouts
assets/css/style.css     site styling
templates/               reusable post template
CNAME                    custom domain for GitHub Pages
```

## Deploy

Production is Cloudflare Pages project `cassrices` on `https://cassrices.com`. Steps, secrets, and DNS checks are in [DEPLOY.md](DEPLOY.md).

Pushing `main` or `tool/job-quote` runs **Deploy quote tool to Cloudflare Pages** and publishes the quote app build as the production deployment. The previous Jekyll GitHub Pages workflow is manual-only. `CNAME` stays until the Pages custom domains are verified, then it should be removed.
