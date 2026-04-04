const fs = require("node:fs/promises");
const path = require("node:path");

async function cleanDist() {
  const distPath = path.resolve("dist");
  await fs.rm(distPath, { recursive: true, force: true });
}

cleanDist().catch((error) => {
  console.error("Failed to clean dist directory.");
  console.error(error);
  process.exit(1);
});
