const fs = require("node:fs/promises");
const path = require("node:path");
const less = require("less");

const sourceFile = path.resolve("project/develop/less/styles.less");
const outputFile = path.resolve("website/css/styles.css");

async function buildLess() {
  const input = await fs.readFile(sourceFile, "utf8");
  const result = await less.render(input, {
    filename: sourceFile,
    compress: false,
    javascriptEnabled: false
  });

  await fs.writeFile(outputFile, result.css, "utf8");
  console.log(`Less compiled: ${path.relative(process.cwd(), outputFile)}`);
}

buildLess().catch((error) => {
  console.error("Less build failed.");
  console.error(error);
  process.exit(1);
});
