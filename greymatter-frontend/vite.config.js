import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev: proxy API calls to the local Flask backend.
      // Start Flask separately on port 5000 before `npm run dev`.
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      // Prerender: proxy API calls to the live API so pages render with data.
      "/api": {
        target: "https://greymatterschool.co.za",
        changeOrigin: true,
        secure: true,
      },
      "/auth": {
        target: "https://greymatterschool.co.za",
        changeOrigin: true,
        secure: true,
      },
      "/uploads": {
        target: "https://greymatterschool.co.za",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});