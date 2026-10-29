#!/usr/bin/env node
"use strict";

// Only the origin-bound developer JWT is public. The signing key stays in Actions memory.
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { createDeveloperToken } = require("./musickit-token.cjs");
const ORIGIN = "https://erickrouss.github.io";

function createPublicToken({ env = process.env, nowSeconds = Math.floor(Date.now() / 1000) } = {}) {
  try {
    return createDeveloperToken({ teamId: env.MUSICKIT_TEAM_ID, keyId: env.MUSICKIT_KEY_ID,
      privateKeyPem: env.MUSICKIT_PRIVATE_KEY, origins: [ORIGIN], lifetimeSeconds: 86400, nowSeconds });
  } catch {
    throw new Error("MusicKit signing configuration is missing or invalid. Check the three repository secrets.");
  }
}

async function writePublicToken({ env = process.env, outDir = path.resolve(__dirname, "../dist"), nowSeconds } = {}) {
  const document = createPublicToken({ env, nowSeconds });
  const directory = path.join(outDir, "itunes-auth");
  const temporary = path.join(directory, `.developer-token.${crypto.randomBytes(8).toString("hex")}.tmp`);
  try {
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(temporary, `${JSON.stringify(document, null, 2)}\n`, { flag: "wx", mode: 0o644 });
    await fs.rename(temporary, path.join(directory, "developer-token.json"));
  } catch {
    throw new Error("Could not write the public MusicKit developer-token document.");
  } finally { await fs.unlink(temporary).catch(() => {}); }
}

if (require.main === module) {
  writePublicToken().then(() => process.stdout.write("Prepared the public origin-bound MusicKit developer token (24 hours).\n")).catch(() => {
    process.stderr.write("MusicKit public-token signing failed. No credential details were printed.\n");
    process.exitCode = 1;
  });
}

module.exports = { createPublicToken, writePublicToken, ORIGIN };
