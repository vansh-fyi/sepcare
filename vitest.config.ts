import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Vitest does not auto-load .env.local into process.env like Next.js
    // does — tests exercise the live Supabase project (no mocking), so
    // SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DEVICE_API_KEY etc. must
    // be present in process.env before the test files import route.ts.
    env: loadEnv("test", process.cwd(), ""),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
