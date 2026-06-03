import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [
    react()
  ],

  base: "/bot/",

  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "lschat.bigefoodcorp.com.ph"
    ],

    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    sourcemap: true,
    minify: "esbuild",
    target: "es2018",

    // 🔥 IMPORTANT FIX
    cssCodeSplit: false,

    lib: {
      entry: "./src/sdk/index.jsx",
      name: "LemonSquareChat",
      fileName: () => "lemonsquare-chat",
      formats: ["iife"],
    },

    rollupOptions: {
      output: {
        inlineDynamicImports: true,

        // 🔥 CRITICAL: ensures CSS is included in JS bundle behavior
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "lemonsquare-chat.css";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },

  define: {
    __LEMONSQUARE_WIDGET__: true,
    "process.env.NODE_ENV": JSON.stringify("production"),
    process: {
      env: {
        NODE_ENV: "production",
      },
    },
  },
});