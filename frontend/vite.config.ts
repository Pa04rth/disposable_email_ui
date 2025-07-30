// File: frontend/vite.config.ts

import path from "path";
import react from "@vitejs/plugin-react-swc"; // <-- This is the correct import for SWC
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000, // We are still keeping the permanent port setting
  },
});
