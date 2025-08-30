// /cloudflare-app/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";

function safe(cmd: string, fallback: string) {
  try { return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); }
  catch { return fallback; }
}

const FULL_SHA =
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  safe("git rev-parse HEAD", "local");
const SHORT_SHA = FULL_SHA.slice(0, 7);

const BRANCH =
  process.env.CF_PAGES_BRANCH ||
  process.env.GITHUB_REF_NAME ||
  safe("git rev-parse --abbrev-ref HEAD", "dev");

const BUILD_DATE = new Date().toISOString();
const PAGES_URL = process.env.CF_PAGES_URL || "";

export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT_HASH__: JSON.stringify(SHORT_SHA),
    __BRANCH__: JSON.stringify(BRANCH),
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
    __PAGES_URL__: JSON.stringify(PAGES_URL),
  },
});
