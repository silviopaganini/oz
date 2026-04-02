import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "website",
  // Treat the entire website folder as static assets so everything is copied to dist
  publicDir: ".",
  server: {
    open: "/index.html"
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Don't let Vite try to bundle the legacy scripts — copy them as-is
    rollupOptions: {
      input: {
        main: resolve(__dirname, "website/index.html")
      }
    },
    // Don't inline or hash small assets; keep the original paths
    assetsInlineLimit: 0,
    copyPublicDir: true
  }
});
