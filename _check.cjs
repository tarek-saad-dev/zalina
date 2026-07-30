const { spawnSync } = require("child_process");
const result = spawnSync("npx", ["tsc", "--noEmit"], { cwd: __dirname, encoding: "utf8", shell: true });
console.log(result.stdout ?? "");
console.log(result.stderr ?? "");
