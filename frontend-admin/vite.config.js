import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,

    proxy: {
      // ================================
      // IMPORTANT FIX
      // ================================
      // Ensures ALL /api requests go to FastAPI backend
      // Prevents CORS issues in development
      // Prevents hardcoded localhost fetch calls from breaking
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,

        // IMPORTANT: DO NOT rewrite /api
        // backend already expects /api prefix
        rewrite: (path) => path,
      },
    },
  },
})