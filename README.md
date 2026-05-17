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

Push to `main`. GitHub Actions deploys the Jekyll site to GitHub Pages.

Custom domain is configured by `CNAME`:

```text
cassrices.com
```
