import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — cached separately; changes only on React upgrades
          vendor: ["react", "react-dom", "react-router-dom"],
          // recharts is large (~400 kB); splitting it improves initial load
          charts: ["recharts"],
        },
      },
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/test-setup.js",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/media": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});