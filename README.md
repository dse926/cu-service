# Meridian CU Service Desk

Help desk and change management ticketing for Meridian Credit Union ($5.2B assets). Staff can open day-to-day IT requests and submit production changes for CAB review, approval, scheduling, and completion.

This build is a **static demo** for GitHub Pages. Ticket state lives in the browser (`localStorage`) and can be reset from the queue.

**Live demo:** https://dse926.github.io/cu-service/  
**GitHub:** https://github.com/dse926/cu-service

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

`build:pages` builds with `NEXT_PUBLIC_BASE_PATH=/cu-service` (project site) and smoke-checks the export.

## Deploy to GitHub Pages

The site is published from the `gh-pages` branch. Rebuild and republish:

```bash
npm run build:pages
# publish out/ to gh-pages (see scripts/publish-github-pages.sh)
bash scripts/publish-github-pages.sh
```

An Actions workflow also lives at `.github/workflows/deploy-github-pages.yml` for Actions-based deploys (requires a token with the `workflow` scope to push the YAML).

### Notes

- Free-plan Pages needs a **public** repo.
- Project site base path is `/cu-service`.
- `.nojekyll` is included so GitHub does not skip `_next/` assets.
