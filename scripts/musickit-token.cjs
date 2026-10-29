#!/usr/bin/env node
"use strict";

// Local signing only. This does not configure or authorize a MusicKit player.
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const { constants } = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_LIFETIME_SECONDS = 3600;
const MAX_LIFETIME_SECONDS = 86400;
const MAX_KEY_BYTES = 16 * 1024;
const ID_PATTERN = /^[A-Z0-9]{10}$/;
const PROJECT_MARKERS = [".git", "Cargo.toml", "package.json", "pyproject.toml", "go.mod"];

class SetupError extends Error {}

const HELP = `Create a local MusicKit developer-token JSON file, using Node's built-in crypto.

Usage:
  node tools/musickit-token.cjs --team-id TEAMID0000 --key-id KEYID00000 \\
    --key /private/path/AuthKey_KEYID00000.p8 --origin https://your-musickit-host.example \\
    --out /private/path/developer-token.json

Required:
  --team-id       Apple Team ID: exactly 10 uppercase letters/digits.
  --key-id        MusicKit/Media Services Key ID: same 10-character format.
  --key           Explicit local, regular, non-symlink .p8 PKCS#8 private-key file.
  --origin        Actual MusicKit Web origin. Repeat for up to 8 origins.
                 HTTPS, or HTTP localhost / 127.0.0.1 / [::1]; no URL paths.
  --out           Explicit .json file in an existing private directory outside projects.

Options:
  --lifetime-seconds N   Default 3600; integer range 1..86400 (one day).
  --overwrite           Deliberately replace an existing regular output file.
  --allow-project-output Deliberately override project/source-control output protection.
  --help                Show this help; no credentials are read.

The key and JWT are never printed. Output is published atomically with POSIX mode 0600.
This token file is NOT yet wired into the current hosted Apple adapter. Signing a
developer token does not authorize a subscriber or solve browser-to-client handoff.
`;

function normaliseOrigins(origins) {
  if (!Array.isArray(origins) || origins.length < 1 || origins.length > 8) {
    throw new SetupError("Provide between 1 and 8 explicit MusicKit Web origins.");
  }
  const result = [];
  for (const value of origins) {
    if (typeof value !== "string" || value.length > 2048 || /\s|@/.test(value)
        || !/^https?:\/\/[^/?#\\]+\/?$/i.test(value)) {
      throw new SetupError("An origin must be an HTTPS origin or an HTTP loopback origin, without credentials, path, query or fragment.");
    }
    let url;
    try { url = new URL(value); } catch {
      throw new SetupError("An origin is not a valid HTTP(S) origin.");
    }
    if (url.protocol === "http:" && !/^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?\/?$/i.test(value)) {
      throw new SetupError("HTTP origins must explicitly name localhost, 127.0.0.1 or [::1].");
    }
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.origin === "null" || url.username || url.password || url.pathname !== "/"
        || url.search || url.hash || (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))) {
      throw new SetupError("Use HTTPS, or HTTP on localhost, 127.0.0.1 or [::1], without URL extras.");
    }
    if (!result.includes(url.origin)) result.push(url.origin);
  }
  return result;
}

function validateClaims({ teamId, keyId, origins, lifetimeSeconds = DEFAULT_LIFETIME_SECONDS,
                          nowSeconds = Math.floor(Date.now() / 1000) }) {
  if (typeof teamId !== "string" || typeof keyId !== "string"
      || !ID_PATTERN.test(teamId) || !ID_PATTERN.test(keyId)) {
    throw new SetupError("Team ID and Key ID must each contain exactly 10 uppercase letters or digits.");
  }
  if (!Number.isSafeInteger(lifetimeSeconds) || lifetimeSeconds < 1 || lifetimeSeconds > MAX_LIFETIME_SECONDS) {
    throw new SetupError("Lifetime must be an integer from 1 through 86400 seconds.");
  }
  if (!Number.isSafeInteger(nowSeconds) || nowSeconds < 0
      || !Number.isSafeInteger(nowSeconds + lifetimeSeconds)) {
    throw new SetupError("The UTC issue/expiry timestamps are invalid.");
  }
  return { teamId, keyId, origins: normaliseOrigins(origins), lifetimeSeconds, nowSeconds };
}

function createDeveloperToken(options) {
  const claims = validateClaims(options);
  const pem = options.privateKeyPem;
  if ((!Buffer.isBuffer(pem) && typeof pem !== "string") || Buffer.byteLength(pem) > MAX_KEY_BYTES
      || !/^\s*-----BEGIN PRIVATE KEY-----\r?\n[A-Za-z0-9+/=\r\n]+-----END PRIVATE KEY-----\s*$/.test(pem.toString())) {
    throw new SetupError("The .p8 file must contain one unencrypted PKCS#8 private key.");
  }
  let key;
  try { key = crypto.createPrivateKey({ key: pem, format: "pem", type: "pkcs8" }); } catch {
    throw new SetupError("The .p8 private key could not be decoded.");
  }
  if (key.asymmetricKeyType !== "ec" || !["prime256v1", "secp256r1", "P-256"].includes(key.asymmetricKeyDetails?.namedCurve)) {
    throw new SetupError("MusicKit requires an EC private key on the P-256 curve.");
  }
  const header = { alg: "ES256", kid: claims.keyId };
  const payload = { iss: claims.teamId, iat: claims.nowSeconds,
                    exp: claims.nowSeconds + claims.lifetimeSeconds, origin: claims.origins };
  const base64url = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const signingInput = `${base64url(header)}.${base64url(payload)}`;
  let signature;
  try {
    // JWS ES256 requires fixed-width r || s, not OpenSSL's default DER encoding.
    signature = crypto.sign("sha256", Buffer.from(signingInput), { key, dsaEncoding: "ieee-p1363" });
  } catch {
    throw new SetupError("The MusicKit developer token could not be signed.");
  }
  if (signature.length !== 64) throw new SetupError("The ES256 signature has an unexpected size.");
  return { schemaVersion: 1, developerToken: `${signingInput}.${signature.toString("base64url")}`,
           keyId: claims.keyId, teamId: claims.teamId, issuedAt: payload.iat, expiresAt: payload.exp,
           origins: claims.origins };
}

async function readP8File(file) {
  if (typeof file !== "string" || !file || path.extname(file).toLowerCase() !== ".p8") {
    throw new SetupError("Choose an explicit local .p8 private-key file.");
  }
  let handle;
  const buffer = Buffer.alloc(MAX_KEY_BYTES + 1);
  try {
    // A .p8 FIFO must not block in open before the regular-file check runs.
    handle = await fs.open(file, constants.O_RDONLY | (constants.O_NOFOLLOW || 0) | (constants.O_NONBLOCK || 0));
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size < 1 || stat.size > MAX_KEY_BYTES) {
      throw new SetupError("The .p8 key must be a nonempty regular file of at most 16 KiB.");
    }
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead > MAX_KEY_BYTES) throw new SetupError("The .p8 key exceeds 16 KiB.");
    return Buffer.from(buffer.subarray(0, bytesRead));
  } catch (error) {
    if (error instanceof SetupError) throw error;
    throw new SetupError("Cannot read the chosen regular, non-symlink .p8 file.");
  } finally {
    buffer.fill(0);
    await handle?.close();
  }
}

async function exists(file) {
  try { return await fs.lstat(file); } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new SetupError("Cannot inspect the chosen output location.");
  }
}

function within(directory, parent) {
  const relative = path.relative(parent, directory);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function prepareOutput(file, { overwrite = false, allowProjectOutput = false } = {}) {
  if (typeof overwrite !== "boolean" || typeof allowProjectOutput !== "boolean") {
    throw new SetupError("Output overrides must be explicit boolean options.");
  }
  if (process.platform === "win32") {
    throw new SetupError("Private mode-0600 output currently requires a POSIX filesystem; Windows ACL setup is not implemented.");
  }
  if (typeof file !== "string" || !file || path.extname(file).toLowerCase() !== ".json") {
    throw new SetupError("Choose an explicit .json output file.");
  }
  let parent;
  try { parent = await fs.realpath(path.dirname(path.resolve(file))); } catch {
    throw new SetupError("Create the chosen private output directory before signing.");
  }
  if (!allowProjectOutput) {
    const project = await fs.realpath(PROJECT_ROOT);
    let forbidden = within(parent, project);
    for (let directory = parent; ; directory = path.dirname(directory)) {
      for (const marker of PROJECT_MARKERS) forbidden ||= Boolean(await exists(path.join(directory, marker)));
      if (forbidden || path.dirname(directory) === directory) break;
    }
    if (forbidden) throw new SetupError("Output inside a project/source-control tree is refused; choose private external storage or explicitly use --allow-project-output.");
  }
  const target = path.join(parent, path.basename(file));
  const stat = await exists(target);
  if (stat && (!stat.isFile() || stat.isSymbolicLink())) {
    throw new SetupError("The output must not be a symlink, directory or special file.");
  }
  if (stat && !overwrite) throw new SetupError("Output already exists; replacement requires --overwrite.");
  return target;
}

async function writeTokenFile(file, document, options = {}) {
  const target = await prepareOutput(file, options);
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${crypto.randomBytes(12).toString("hex")}.tmp`);
  let handle;
  try {
    handle = await fs.open(temporary, "wx", 0o600);
    await handle.chmod(0o600);
    await handle.writeFile(`${JSON.stringify(document, null, 2)}\n`, "utf8");
    await handle.sync();
    await handle.close();
    handle = null;
    if (options.overwrite) {
      // Rename replaces the selected directory entry atomically, not a symlink target.
      await fs.rename(temporary, target);
    } else {
      // Atomic no-clobber publication: a concurrent output creator wins safely.
      await fs.link(temporary, target);
      await fs.unlink(temporary);
    }
  } catch (error) {
    if (error.code === "EEXIST") throw new SetupError("Output already exists; replacement requires --overwrite.");
    throw new SetupError("Cannot atomically save the private token JSON file.");
  } finally {
    await handle?.close();
    await fs.unlink(temporary).catch(() => {});
  }
}

function parseArguments(args) {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) return { help: true };
  const result = { origins: [] };
  const names = { "--team-id": "teamId", "--key-id": "keyId", "--key": "keyFile", "--out": "output",
                  "--lifetime-seconds": "lifetimeSeconds" };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--overwrite" || arg === "--allow-project-output") {
      const name = arg === "--overwrite" ? "overwrite" : "allowProjectOutput";
      if (result[name]) throw new SetupError("An option was repeated.");
      result[name] = true;
      continue;
    }
    const name = arg === "--origin" ? "origins" : names[arg];
    if (!name || index + 1 >= args.length || args[index + 1].startsWith("--")) {
      throw new SetupError("Unknown option or missing value; use --help.");
    }
    const value = args[++index];
    if (name === "origins") result.origins.push(value);
    else {
      if (result[name] !== undefined) throw new SetupError("An option was repeated.");
      result[name] = value;
    }
  }
  if (result.lifetimeSeconds !== undefined) {
    if (!/^[1-9][0-9]*$/.test(result.lifetimeSeconds)) throw new SetupError("Lifetime must be an integer from 1 through 86400 seconds.");
    result.lifetimeSeconds = Number(result.lifetimeSeconds);
  }
  if (!result.keyFile || !result.output) throw new SetupError("Both --key and --out are required; use --help.");
  validateClaims(result);
  return result;
}

async function run(args) {
  const options = parseArguments(args);
  if (options.help) return HELP;
  await prepareOutput(options.output, options);
  const pem = await readP8File(options.keyFile);
  try {
    const document = createDeveloperToken({ ...options, privateKeyPem: pem });
    await writeTokenFile(options.output, document, options);
  } finally { pem.fill(0); }
  return "Saved developer-token JSON to the chosen private file (0600).\nIt is not yet wired into the current hosted Apple adapter or browser authorization handoff.\n";
}

if (require.main === module) {
  run(process.argv.slice(2)).then(message => process.stdout.write(message)).catch(error => {
    // Never echo parser/OpenSSL/filesystem errors or user arguments containing secrets.
    process.stderr.write(`MusicKit setup: ${error instanceof SetupError ? error.message : "Operation failed; no credentials were printed."}\n`);
    process.exitCode = 1;
  });
}

module.exports = { createDeveloperToken, normaliseOrigins, readP8File, writeTokenFile, prepareOutput, run,
                   DEFAULT_LIFETIME_SECONDS, MAX_LIFETIME_SECONDS, PROJECT_ROOT };
