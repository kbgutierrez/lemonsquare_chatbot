import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/bot/admin/",

  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 6001,
    allowedHosts: ["lschat.bigefoodcorp.com.ph"],

    proxy: {
      "/bot/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the full /bot/api path
      },

      "/self_knowledge": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});