import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

/*
  SDK-READY VITE CONFIG
*/

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    host: "0.0.0.0",

    port: 5173,

    proxy: {
      "/api": {
        target:
          "http://localhost:8000",

        changeOrigin: true,

        secure: false,
      },
    },
  },

  build: {
    sourcemap: true,

    minify: "esbuild",

    target: "es2018",

    cssCodeSplit: false,

    lib: {
      entry:
        "./src/sdk/index.jsx",

      name:
        "LemonSquareChat",

      fileName:
        () =>
          "lemonsquare-chat.js",

      formats: ["iife"],
    },

    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },

  define: {
    __LEMONSQUARE_WIDGET__:
      true,

    "process.env.NODE_ENV":
      JSON.stringify(
        "production"
      ),

    process: {
      env: {
        NODE_ENV:
          "production",
      },
    },
  },
})