import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "website",
  // Keep legacy files path-stable by copying from website as-is.
  publicDir: ".",
  appType: "mpa",
  server: {
    open: "/index.html"
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
    // Preserve existing entrypoint and avoid forcing module migration now.
    rollupOptions: {
      input: {
        main: resolve(__dirname, "website/index.html")
      }
    },
    // Keep legacy asset lookup behavior stable.
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    copyPublicDir: true
  }
});
