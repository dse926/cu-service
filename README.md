# Meridian CU Service Desk

Help desk and change management ticketing for Meridian Credit Union ($5.2B assets). Staff can open day-to-day IT requests and submit production changes for CAB review, approval, scheduling, and completion.

This build is a **static demo** for GitHub Pages. Ticket state lives in the browser (`localStorage`) and can be reset from the queue.

## Features

- **Operations queue** with filters for help desk, change management, CAB pending, and critical work
- **Help desk tickets** for access, hardware, software, network, email, and telephony
- **Change requests** with risk, impact, maintenance windows, implementation/rollback plans, and CAB voting
- Seeded credit-union IT backlog for demos

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3456](http://localhost:3456).

## Static / Pages build

```bash
npm run build:pages
npx serve out
```

`build:pages` builds with `NEXT_PUBLIC_BASE_PATH=/cu-service` (project site) and smoke-checks the export. For a user site (`username.github.io`), build with an empty base path:

```bash
NEXT_PUBLIC_BASE_PATH= npm run build
```

## Deploy to GitHub Pages

The workflow [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) builds the static export and publishes it with the official Pages actions.

### One-time GitHub setup

1. Create a **public** GitHub repository (Free-plan Pages requires a public repo), e.g. `david-elliott-dev/cu-service`.
2. Push this project to that repo’s `main` branch.
3. Open **Settings → Pages → Build and deployment**.
4. Set **Source** to **GitHub Actions** (not “Deploy from a branch”).
5. Push to `main` or run **Actions → Deploy to GitHub Pages → Run workflow**.

Demo URL will be:

`https://<owner>.github.io/<repo>/`

Example: `https://david-elliott-dev.github.io/cu-service/`

### Notes

- The workflow sets `NEXT_PUBLIC_BASE_PATH` from the Pages base path automatically.
- `.nojekyll` is written into `out/` so GitHub does not skip `_next/` assets.
- Origin (`cursor.com/codebase/...`) does not host Pages; you need a GitHub remote for this workflow to run.
