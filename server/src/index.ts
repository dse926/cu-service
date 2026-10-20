import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.js";
import { env } from "./config.js";

const app = buildApp();
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Optional combined host: serve Next static export beside the API.
 * On Azure App Service, STATIC_ROOT points at the deployed `out/` folder.
 * Build the UI with NEXT_PUBLIC_BASE_PATH= (empty) for Azure hosting.
 */
const staticRoot =
  process.env.STATIC_ROOT || join(__dirname, "..", "..", "out");
if (existsSync(join(staticRoot, "index.html"))) {
  app.get("/", serveStatic({ root: staticRoot, path: "index.html" }));
  app.use("/*", serveStatic({ root: staticRoot }));
  console.log(`Serving static UI from ${staticRoot}`);
}

console.log(
  `Meridian CU API listening on :${env.port} (mockIntegrations=${env.mockIntegrations})`
);

serve({ fetch: app.fetch, port: env.port });
