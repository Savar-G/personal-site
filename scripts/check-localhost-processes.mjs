import { execFileSync } from "node:child_process";

function commandOutput(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" });
  } catch (error) {
    return error.stdout?.toString() ?? "";
  }
}

const lsof = commandOutput("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"]);
const nodeListeners = lsof
  .split("\n")
  .filter((line) => /^(node|next)\s/i.test(line));

if (nodeListeners.length === 0) {
  console.log("PASS: no Node/Next localhost listeners are running");
} else {
  console.log("Active Node/Next listeners (inspect ownership before stopping):");
  console.log(nodeListeners.join("\n"));
  process.exitCode = 1;
}
