// Integration tests for server.js: the /status version handshake used to
// detect stale servers, and the /__local__ file route used by previews.
// Run with: npm test

const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const serverPath = path.join(__dirname, "..", "server.js");
// Deterministic high port (no Math.random needed) to avoid clashing with the
// plugin's default 8000.
const PORT = 20000 + (process.pid % 10000);
const BASE = `http://localhost:${PORT}`;
const VERSION = "test-sig-123";

let child;
let tmpDir;
let assetPath;

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`${BASE}/status`, { method: "POST" });
      if (res.ok) return;
    } catch (_) {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("server did not start");
}

test.before(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "prevmark-"));
  assetPath = path.join(tmpDir, "asset.txt");
  fs.writeFileSync(assetPath, "LOCAL-ASSET-BODY");

  child = spawn("node", [serverPath, String(PORT), tmpDir, VERSION], {
    stdio: "ignore",
  });
  await waitForServer();
});

test.after(() => {
  if (child) child.kill("SIGKILL");
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("/status reports the version the server was started with", async () => {
  const res = await fetch(`${BASE}/status`, { method: "POST" });
  const body = await res.json();
  assert.equal(body.version, VERSION);
  assert.ok(Array.isArray(body.nvimProcs));
});

test("/__local__ serves a local file over HTTP", async () => {
  const res = await fetch(`${BASE}/__local__${assetPath}`);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "LOCAL-ASSET-BODY");
});

test("/__local__ returns 404 for a missing file", async () => {
  const res = await fetch(`${BASE}/__local__${assetPath}.nope`);
  assert.equal(res.status, 404);
});
