import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv.slice(2);
const port = Number.parseInt(process.env.PORT ?? "3100", 10);
const url = `http://127.0.0.1:${port}`;
const playwrightSession = `personal-site-agent-${process.pid}`;
const playwrightCli = path.join(
  process.env.HOME ?? "",
  ".codex/skills/playwright/scripts/playwright_cli.sh",
);

let serverProcess;
let taskProcess;
let cleanupStarted = false;

function childPids(pid) {
  const result = spawnSync("pgrep", ["-P", String(pid)], {
    encoding: "utf8",
  });

  return result.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

function signalProcessTree(pid, signal) {
  for (const childPid of childPids(pid)) {
    signalProcessTree(childPid, signal);
  }

  try {
    process.kill(pid, signal);
  } catch {
    // The process already exited.
  }
}

function closePlaywrightSession() {
  if (!command.join(" ").includes("playwright") || !process.env.HOME) return;

  spawnSync(playwrightCli, ["--session", playwrightSession, "close"], {
    cwd: projectRoot,
    env: { ...process.env, PLAYWRIGHT_CLI_SESSION: playwrightSession },
    stdio: "ignore",
    timeout: 10_000,
  });
}

async function cleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;

  closePlaywrightSession();

  if (taskProcess?.pid) signalProcessTree(taskProcess.pid, "SIGTERM");
  if (serverProcess?.pid) signalProcessTree(serverProcess.pid, "SIGTERM");

  await new Promise((resolve) => setTimeout(resolve, 300));

  if (taskProcess?.pid) signalProcessTree(taskProcess.pid, "SIGKILL");
  if (serverProcess?.pid) signalProcessTree(serverProcess.pid, "SIGKILL");
}

function canConnect() {
  return fetch(url, { signal: AbortSignal.timeout(500) })
    .then(() => true)
    .catch(() => false);
}

async function waitForServer() {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Dev server exited with code ${serverProcess.exitCode}`);
    }
    if (await canConnect()) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error(`Dev server did not become ready at ${url}`);
}

function runTask() {
  return new Promise((resolve, reject) => {
    taskProcess = spawn(command[0], command.slice(1), {
      cwd: projectRoot,
      env: {
        ...process.env,
        LOCAL_URL: url,
        PLAYWRIGHT_CLI_SESSION: playwrightSession,
        PORT: String(port),
      },
      stdio: "inherit",
    });

    taskProcess.once("error", reject);
    taskProcess.once("exit", (code, signal) => {
      resolve(signal ? 1 : (code ?? 1));
    });
  });
}

async function main() {
  if (command.length === 0) {
    throw new Error(
      "Usage: npm run dev:agent -- <verification command and arguments>",
    );
  }
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }
  if (await canConnect()) {
    throw new Error(`${url} is already in use; refusing to start another server`);
  }

  serverProcess = spawn(
    "npm",
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: "inherit",
    },
  );

  await waitForServer();
  console.log(`[dev:agent] Ready at ${url}`);

  const exitCode = await runTask();
  process.exitCode = exitCode;
}

for (const [signal, exitCode] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
  ["SIGHUP", 129],
]) {
  process.once(signal, async () => {
    await cleanup();
    process.exit(exitCode);
  });
}

try {
  await main();
} catch (error) {
  console.error(`[dev:agent] ${error.message}`);
  process.exitCode = 1;
} finally {
  await cleanup();
}
