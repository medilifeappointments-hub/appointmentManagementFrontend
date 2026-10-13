import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET has no VITE_ prefix, so it is read by Vite only and never reaches the browser bundle.
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.API_PROXY_TARGET || "http://localhost:4000";
  const proxy = { "/api": { target: apiTarget, changeOrigin: false } };

  return {
    plugins: [react()],
    // Same-origin in development too: the browser talks to Vite, which forwards /api to Express.
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, proxy },
    build: { sourcemap: false, chunkSizeWarningLimit: 1000 },
  };
});
