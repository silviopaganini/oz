const fs = require("node:fs/promises");
const path = require("node:path");

async function replaceAppDetectReference() {
  const distIndexPath = path.resolve("dist/index.html");
  const content = await fs.readFile(distIndexPath, "utf8");
  const next = content.replaceAll("./js/appDetect", "./js/appDetect.min");
  await fs.writeFile(distIndexPath, next, "utf8");
}

async function cleanupTempMinifiedFiles() {
  const tempFiles = [
    path.resolve("website/js/app.min.js"),
    path.resolve("website/js/appDetect.min.js")
  ];

  await Promise.all(tempFiles.map((file) => fs.rm(file, { force: true })));
}

async function run() {
  await replaceAppDetectReference();
  await cleanupTempMinifiedFiles();
}

run().catch((error) => {
  console.error("Post-build dist step failed.");
  console.error(error);
  process.exit(1);
});
