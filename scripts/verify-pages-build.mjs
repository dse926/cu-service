#!/usr/bin/env node
/**
 * Smoke-check a static export built for GitHub project Pages.
 * Usage: NEXT_PUBLIC_BASE_PATH=/cu-service node scripts/verify-pages-build.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const out = join(process.cwd(), "out");
const index = join(out, "index.html");

const required = [
  "index.html",
  "404.html",
  ".nojekyll",
  "tickets/view/index.html",
  "new/help-desk/index.html",
  "new/change/index.html",
  "teams/index.html",
];

let failed = false;

for (const rel of required) {
  const path = join(out, rel);
  if (!existsSync(path)) {
    console.error(`Missing: out/${rel}`);
    failed = true;
  }
}

if (!existsSync(index)) {
  process.exit(1);
}

const html = readFileSync(index, "utf8");
if (base) {
  const needle = `src="${base}/_next/`;
  if (!html.includes(needle) && !html.includes(`href="${base}/_next/`)) {
    console.error(`Expected asset URLs under ${base}/_next/ in out/index.html`);
    failed = true;
  } else {
    console.log(`OK: assets prefixed with ${base}`);
  }
} else {
  if (html.includes('src="/_next/') || html.includes('href="/_next/')) {
    console.log("OK: root-site asset paths");
  } else {
    console.error("Could not find /_next/ asset paths in out/index.html");
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("GitHub Pages static export looks good.");
