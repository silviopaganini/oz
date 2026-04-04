const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const watchDir = path.resolve("project/develop/less");

function runBuild() {
  const child = spawn("node", ["./scripts/less-build.cjs"], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error("Less watch build step failed.");
    }
  });
}

let debounceTimer = null;
fs.watch(watchDir, { recursive: true }, () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    runBuild();
  }, 150);
});

console.log(`Watching Less sources: ${path.relative(process.cwd(), watchDir)}`);
