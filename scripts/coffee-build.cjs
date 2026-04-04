const { spawn } = require("node:child_process");
const { coffeeTargets } = require("./build-config.cjs");

const targetName = process.argv[2];
const watchMode = process.argv.includes("--watch");

if (!targetName || !coffeeTargets[targetName]) {
  console.error("Usage: node ./scripts/coffee-build.cjs <app|detect> [--watch]");
  process.exit(1);
}

const target = coffeeTargets[targetName];
const args = [];

if (watchMode) {
  args.push("--watch");
}

args.push("--join", target.output, "--compile", ...target.inputs);

const child = spawn("./node_modules/.bin/coffee", args, {
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
