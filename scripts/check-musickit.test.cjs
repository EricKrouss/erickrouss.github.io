"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { checkMusicKit, ORIGIN } = require("./check-musickit.cjs");
const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
const env = { MUSICKIT_TEAM_ID: "TEAMID0000", MUSICKIT_KEY_ID: "KEYID00000",
  MUSICKIT_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }) };

test("the Actions check signs an origin-bound short-lived JWT and sends only to Apple's fixed API", async () => {
  let calls = 0;
  const message = await checkMusicKit({ env, request: async (url, options) => {
    calls++;
    assert.equal(url, "https://api.music.apple.com/v1/test");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Origin, ORIGIN);
    const token = options.headers.Authorization.slice("Bearer ".length);
    const [header, payload, signature] = token.split(".");
    assert.deepEqual(JSON.parse(Buffer.from(header, "base64url")), { alg: "ES256", kid: env.MUSICKIT_KEY_ID });
    const claims = JSON.parse(Buffer.from(payload, "base64url"));
    assert.equal(claims.iss, env.MUSICKIT_TEAM_ID);
    assert.deepEqual(claims.origin, [ORIGIN]);
    assert.equal(claims.exp - claims.iat, 300);
    assert(crypto.verify("sha256", Buffer.from(`${header}.${payload}`), {key: publicKey, dsaEncoding: "ieee-p1363"}, Buffer.from(signature, "base64url")));
    return { ok: true, status: 200 };
  } });
  assert.equal(calls, 1);
  assert(!message.includes("Bearer"));
  assert(!message.includes("PRIVATE KEY"));
  assert(message.includes("does not authorize a subscriber"));
});

test("invalid secrets stop before a network request and failures never echo secrets", async () => {
  let calls = 0;
  const request = async () => { calls++; throw new Error(env.MUSICKIT_PRIVATE_KEY); };
  await assert.rejects(checkMusicKit({env: {}, request}), /configuration is missing or invalid/);
  assert.equal(calls, 0);
  await assert.rejects(checkMusicKit({env, request}), error => !error.message.includes("PRIVATE KEY") && error.message.includes("could not complete"));
  assert.equal(calls, 1);
  await assert.rejects(checkMusicKit({env, request: async () => ({ok: false, status: 401, body: "must not be logged"})}), /\(HTTP 401\)/);
});
