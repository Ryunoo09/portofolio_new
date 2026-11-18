import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";

/**
 * Boots the standalone production build in its own process so tests can assert
 * real response headers. `next dev` answers `no-store`, so the ISR contract is
 * invisible there. Run `pnpm build` before `pnpm test:e2e`.
 */

const STANDALONE = join(process.cwd(), ".next", "standalone");

export function isProductionBuildAvailable(): boolean {
  return existsSync(join(STANDALONE, "server.js"));
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });
}

export type RunningServer = { url: string; close: () => void };

async function waitUntilResponding(url: string, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // server still booting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`${url} did not start within ${timeoutMs}ms`);
}

export async function startProductionServer(): Promise<RunningServer> {
  const port = await freePort();
  const child: ChildProcess = spawn(process.execPath, [join(STANDALONE, "server.js")], {
    cwd: STANDALONE,
    env: { ...process.env, NODE_ENV: "production", PORT: String(port), HOSTNAME: "127.0.0.1" },
    stdio: "ignore",
  });

  const url = `http://127.0.0.1:${port}`;
  await waitUntilResponding(`${url}/api/health`);

  return { url, close: () => child.kill() };
}
