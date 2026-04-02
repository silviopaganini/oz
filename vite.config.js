import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "website",
  publicDir: false,
  server: {
    open: "/index.html"
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "website/index.html")
      }
    }
  }
});
