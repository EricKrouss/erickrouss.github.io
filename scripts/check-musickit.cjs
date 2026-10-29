#!/usr/bin/env node
"use strict";

// Manual Actions check only: never writes or publishes the private key or JWT.
const { createDeveloperToken } = require("./musickit-token.cjs");
const ORIGIN = "https://erickrouss.github.io";

async function checkMusicKit({ env = process.env, request = fetch } = {}) {
  let document;
  try {
    document = createDeveloperToken({
      teamId: env.MUSICKIT_TEAM_ID,
      keyId: env.MUSICKIT_KEY_ID,
      privateKeyPem: env.MUSICKIT_PRIVATE_KEY,
      origins: [ORIGIN],
      lifetimeSeconds: 300,
    });
  } catch {
    throw new Error("MusicKit signing configuration is missing or invalid. Check the three repository secrets.");
  }
  let response;
  try {
    response = await request("https://api.music.apple.com/v1/test", {
      method: "GET",
      headers: { Authorization: `Bearer ${document.developerToken}`, Origin: ORIGIN },
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error("Apple's developer-token check could not complete. No request or credential details were printed.");
  }
  // Never include Apple's response body, URL parameters, or authorization data.
  if (!response.ok) {
    const status = Number.isInteger(response.status) && response.status >= 100 && response.status <= 599 ? response.status : 0;
    throw new Error(`Apple rejected the MusicKit developer-token check (HTTP ${status}).`);
  }
  return "MusicKit developer-token signing and Apple's API check passed. This does not authorize a subscriber or validate app playback.";
}

if (require.main === module) {
  checkMusicKit().then(message => process.stdout.write(`${message}\n`)).catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { checkMusicKit, ORIGIN };
