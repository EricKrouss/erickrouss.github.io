"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createPublicToken, writePublicToken, ORIGIN } = require("./build-musickit-public-token.cjs");
const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
const env = { MUSICKIT_TEAM_ID: "TEAMID0000", MUSICKIT_KEY_ID: "KEYID00000",
  MUSICKIT_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }) };

test("the public document contains a verifiable ES256 JWT restricted to the website for 24 hours", () => {
  const document = createPublicToken({ env, nowSeconds: 1800000000 });
  const [header, payload, signature] = document.developerToken.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(header, "base64url")), { alg: "ES256", kid: env.MUSICKIT_KEY_ID });
  assert.deepEqual(JSON.parse(Buffer.from(payload, "base64url")), {
    iss: env.MUSICKIT_TEAM_ID, iat: 1800000000, exp: 1800086400, origin: [ORIGIN],
  });
  assert(crypto.verify("sha256", Buffer.from(`${header}.${payload}`),
    { key: publicKey, dsaEncoding: "ieee-p1363" }, Buffer.from(signature, "base64url")));
  assert.equal(document.expiresAt - document.issuedAt, 86400);
  assert(!JSON.stringify(document).includes("PRIVATE KEY"));
  assert(!JSON.stringify(document).includes(env.MUSICKIT_PRIVATE_KEY));
});

test("build output contains only the public document and no signing-key file", async () => {
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "itunes-public-token-test-"));
  try {
    await writePublicToken({ env, outDir, nowSeconds: 1800000000 });
    assert.deepEqual(await fs.readdir(outDir), ["itunes-auth"]);
    assert.deepEqual(await fs.readdir(path.join(outDir, "itunes-auth")), ["developer-token.json"]);
    const document = JSON.parse(await fs.readFile(path.join(outDir, "itunes-auth/developer-token.json"), "utf8"));
    assert.equal(document.origins[0], ORIGIN);
    assert.equal(document.expiresAt, 1800086400);
  } finally { await fs.rm(outDir, { recursive: true, force: true }); }
});

test("invalid signing configuration fails without exposing the configured value", () => {
  assert.throws(() => createPublicToken({ env: { ...env, MUSICKIT_PRIVATE_KEY: "private sentinel value" } }), error => {
    assert(!error.message.includes("sentinel"));
    return /configuration is missing or invalid/.test(error.message);
  });
});
