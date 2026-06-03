import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin()
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
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "lemonsquare-chat.css";
          }
          return assetInfo.name;
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