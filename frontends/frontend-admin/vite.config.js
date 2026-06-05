import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/bot/admin/",

  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 6001,

    proxy: {
      "/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
        secure: false,
      },
      "/bot/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/bot\/api/, ""),
        changeOrigin: true,
        secure: false,
      },

      "/self_knowledge": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});