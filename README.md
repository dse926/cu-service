# Meridian CU Service Desk

Help desk and change management ticketing for Meridian Credit Union ($5.2B assets). Staff can open day-to-day IT requests and submit production changes for CAB review, approval, scheduling, and completion.

This build is a **static demo** suitable for GitHub Pages. Ticket state lives in the browser (`localStorage`) and can be reset from the queue.

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

## Static build

```bash
npm run build
npx serve out
```

Optional project-pages base path:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run build
```

## Deploy to GitHub Pages

1. Push this repo to GitHub (public or with Pages enabled).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually).
4. Share the site URL from the Actions deploy summary (usually `https://<user>.github.io/<repo>/`).

The workflow sets `NEXT_PUBLIC_BASE_PATH` automatically for project sites.
