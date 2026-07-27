import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["dinex.svg"],
      manifest: {
        name: "DINEX",
        short_name: "DINEX",
        description: "Restaurant POS + Self Ordering Kiosk",
        start_url: "/",
        display: "standalone",
        background_color: "#0B0C10",
        theme_color: "#0B0C10",
        icons: [{ src: "/dinex.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }]
      }
    })
  ],
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});

