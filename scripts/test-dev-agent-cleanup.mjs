import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runner = path.join(projectRoot, "scripts", "with-dev-server.mjs");
const port = 3198;

function isListening() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(250, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitFor(predicate, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

async function main() {
  const child = spawn(
    process.execPath,
    [runner, process.execPath, "-e", "setInterval(() => {}, 1000)"],
    {
      cwd: projectRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
    },
  );

  const started = await waitFor(isListening, 20_000);
  if (!started) {
    child.kill("SIGTERM");
    throw new Error("Guarded dev server never became reachable");
  }

  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));

  const stopped = await waitFor(async () => !(await isListening()), 5_000);
  if (!stopped) {
    throw new Error(`Port ${port} still listens after the runner was interrupted`);
  }

  console.log(`PASS: interrupted verification released localhost:${port}`);
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
