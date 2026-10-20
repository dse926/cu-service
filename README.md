# Meridian CU Service Desk

Help desk and change management ticketing for Meridian Credit Union ($5.2B assets). Staff can open day-to-day IT requests and submit production changes for CAB review, approval, scheduling, and completion.

## Features

- **Operations queue** with filters for help desk, change management, CAB pending, and critical work
- **Help desk tickets** for access, hardware, software, network, email, and telephony
- **Change requests** with risk, impact, maintenance windows, implementation/rollback plans, and CAB voting
- Seeded demo data for a realistic credit-union IT backlog (no database required)

## Run locally

```bash
npm install
npm run dev -- --port 3456
```

Open [http://localhost:3456](http://localhost:3456).

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui. Ticket state is held in-memory for local demos and resets when the server restarts.
