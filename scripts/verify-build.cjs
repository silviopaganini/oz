const fs = require("node:fs/promises");
const path = require("node:path");

const target = process.argv[2];
const validTargets = new Set(["website", "dist"]);

if (!validTargets.has(target)) {
  console.error("Usage: node ./scripts/verify-build.cjs <website|dist>");
  process.exit(1);
}

const root = path.resolve(target);
const indexPath = path.join(root, "index.html");

async function assertExists(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    await fs.access(absolutePath);
  } catch {
    throw new Error(`Missing required file: ${path.join(target, relativePath)}`);
  }
}

async function verifyHtmlReferences() {
  const html = await fs.readFile(indexPath, "utf8");
  const requiredCss = [
    "./css/normalise.css",
    "./css/styles.css",
    "./css/spinner.css"
  ];

  for (const href of requiredCss) {
    if (!html.includes(href)) {
      throw new Error(`Missing stylesheet reference in ${target}/index.html: ${href}`);
    }
  }

  if (target === "website" && !html.includes('data-main="./js/appDetect"')) {
    throw new Error("website/index.html must reference ./js/appDetect");
  }

  if (target === "dist" && !html.includes('data-main="./js/appDetect.min"')) {
    throw new Error("dist/index.html must reference ./js/appDetect.min");
  }
}

async function run() {
  await assertExists("js/app.js");
  await assertExists("js/appDetect.js");
  await assertExists("css/styles.css");
  await assertExists("index.html");

  if (target === "dist") {
    await assertExists("js/appDetect.min.js");
  }

  await verifyHtmlReferences();
  console.log(`Build verification passed for ${target}.`);
}

run().catch((error) => {
  console.error("Build verification failed.");
  console.error(error.message);
  process.exit(1);
});
