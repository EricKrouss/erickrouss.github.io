"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { createPublicToken, ORIGIN } = require("./build-musickit-public-token.cjs");

const source = relative => fs.readFileSync(path.join(__dirname, "../public", relative), "utf8");
const shared = source("itunes-shared/musickit-bootstrap.js");
const auth = source("itunes-auth/auth.js");
const player = source("itunes-player/player.js");
const state = "A".repeat(43);
const callback = `http://127.0.0.1:32768/callback/${"B".repeat(43)}`;
const token = "own-app-user-token-sentinel";
const { privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
const env = { MUSICKIT_TEAM_ID: "TEAMID0000", MUSICKIT_KEY_ID: "KEYID00000",
  MUSICKIT_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }) };

function context({ url = `${ORIGIN}/itunes-auth/?${new URLSearchParams({ callback, state })}`, fetch, music, bridge, timers } = {}) {
  const elements = new Map(["status", "detail", "sign-in", "cancel"].map(id => [id, {
    disabled: true, textContent: "", dataset: {}, listeners: {}, addEventListener(name, handler) { this.listeners[name] = handler; },
  }]));
  const calls = [], history = [], reports = [];
  const current = new URL(url);
  const window = {
    location: current,
    history: { replaceState(...args) { history.push(args); } },
    document: { getElementById: id => elements.get(id) },
    atob: value => Buffer.from(value, "base64").toString("binary"),
    fetch: async (...args) => {
      calls.push(args);
      if (fetch) return fetch(...args);
      if (args[0].startsWith(`${ORIGIN}/itunes-auth/developer-token.json?`)) {
        return { ok: true, json: async () => createPublicToken({ env }) };
      }
      return { ok: true, json: async () => ({ ok: true }) };
    },
    MusicKit: { configure: async options => { calls.push(["configure", options]); }, getInstance: () => music },
    tunesPlayerBridge: bridge ? { ...bridge, report: event => reports.push(event) } : undefined,
    console: { log() { throw new Error("unexpected logging"); }, error() { throw new Error("unexpected logging"); } },
  };
  const sandbox = vm.createContext({ window, URL, URLSearchParams, AbortController,
    setTimeout: timers?.setTimeout || setTimeout, clearTimeout: timers?.clearTimeout || clearTimeout,
    console: window.console });
  vm.runInContext(shared, sandbox);
  return { window, sandbox, elements, calls, history, reports,
    runAuth: () => vm.runInContext(auth, sandbox), runPlayer: () => vm.runInContext(player, sandbox) };
}

const settle = () => new Promise(resolve => setImmediate(resolve));
const plain = value => JSON.parse(JSON.stringify(value));

test("static MusicKit pages version every local script using its current content hash", () => {
  for (const [page, assets] of [
    ["itunes-auth/index.html", ["itunes-shared/musickit-bootstrap.js", "itunes-auth/auth.js"]],
    ["itunes-player/index.html", ["itunes-shared/musickit-bootstrap.js", "itunes-player/player.js"]],
  ]) {
    const references = [...source(page).matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    const expected = assets.map(asset => `/${asset}?v=${crypto.createHash("sha256").update(source(asset)).digest("hex").slice(0, 12)}`);
    assert.deepEqual(references, expected, `${page} must change script URLs whenever script bytes change`);
  }
});

test("callback parsing accepts only the owned numeric loopback callback and independent 43-character state", () => {
  const { window } = context();
  const bootstrap = window.TunesMusicKitBootstrap;
  assert.deepEqual(plain(bootstrap.readHandoff(window.location)), { callback, state });
  for (const bad of [
    "https://127.0.0.1:32768/callback/" + "B".repeat(43),
    "http://localhost:32768/callback/" + "B".repeat(43),
    "http://127.0.0.2:32768/callback/" + "B".repeat(43),
    "http://127.0.0.1:80/callback/" + "B".repeat(43),
    "http://127.0.0.1:65536/callback/" + "B".repeat(43),
    callback + "?token=x", callback + "#fragment", callback.replace("/callback/", "/%63allback/"),
    callback.replace("127.0.0.1", "user@127.0.0.1"), callback.replace("127.0.0.1", "2130706433"),
  ]) assert.throws(() => bootstrap.validateCallback(bad));
  for (const query of [
    new URLSearchParams({ callback, state: "short" }).toString(),
    new URLSearchParams({ callback, state, extra: "no" }).toString(),
    `${new URLSearchParams({ callback, state })}&state=${state}`,
  ]) assert.throws(() => bootstrap.readHandoff(new URL(`${ORIGIN}/itunes-auth/?${query}`)));
  assert.throws(() => bootstrap.readHandoff(new URL(`https://other.example/itunes-auth/?${new URLSearchParams({ callback, state })}`)));
});

test("invalid handoff never configures MusicKit, authorizes, or sends a callback", async () => {
  const c = context({ url: `${ORIGIN}/itunes-auth/?callback=https://other.example/&state=${state}` });
  c.runAuth();
  await settle();
  assert.equal(c.calls.length, 0);
  assert.equal(c.history.length, 0);
  assert.equal(c.elements.get("sign-in").disabled, true);
});

test("explicit sign-in uses own SDK getter and posts token only in the private callback body", async () => {
  const own = { authorizeCalls: 0, async authorize() { this.authorizeCalls++; return "ignored-return-value"; }, musicUserToken: token };
  const c = context({ music: own });
  c.runAuth();
  assert.deepEqual(plain(c.history), [[null, "", "/itunes-auth/"]]);
  await settle();
  assert.equal(own.authorizeCalls, 0);
  await c.elements.get("sign-in").listeners.click();
  assert.equal(own.authorizeCalls, 1);
  const posted = c.calls.find(([url]) => url === callback);
  assert(posted);
  assert.equal(posted[1].credentials, "omit");
  assert.equal(posted[1].mode, "cors");
  assert.equal(posted[1].redirect, "error");
  assert.deepEqual(JSON.parse(posted[1].body), { state, music_user_token: token });
  assert(!c.calls.some(([url]) => url.includes(token)));
  assert(!JSON.stringify(c.history).includes(token));
  assert(![...c.elements.values()].some(element => element.textContent.includes(token)));
  assert.equal(c.elements.get("cancel").disabled, true);
});

test("empty own SDK token fails without posting even if authorize returns a string", async () => {
  const c = context({ music: { authorize: async () => token, musicUserToken: "" } });
  c.runAuth(); await settle();
  await c.elements.get("sign-in").listeners.click();
  assert(!c.calls.some(([url]) => url === callback));
  assert.equal(c.elements.get("sign-in").disabled, false);
});

test("cancel posts only cancellation and suppresses a still-pending authorization result", async () => {
  let resolveAuthorization;
  const music = { authorize: () => new Promise(resolve => { resolveAuthorization = resolve; }), musicUserToken: token };
  const c = context({ music });
  c.runAuth(); await settle();
  const signing = c.elements.get("sign-in").listeners.click();
  await c.elements.get("cancel").listeners.click();
  resolveAuthorization(token); await signing;
  const posts = c.calls.filter(([url]) => url === callback);
  assert.equal(posts.length, 1);
  assert.deepEqual(JSON.parse(posts[0][1].body), { state, cancelled: true });
});

test("callback rejection requires a fresh connection rather than retrying a potentially expired request", async () => {
  let posts = 0;
  const c = context({ music: { authorize: async () => token, musicUserToken: token }, fetch: async url => {
    if (url.startsWith(`${ORIGIN}/itunes-auth/developer-token.json?`)) return { ok: true, json: async () => createPublicToken({ env }) };
    return { ok: ++posts > 1, json: async () => ({ ok: true }) };
  } });
  c.runAuth(); await settle();
  await c.elements.get("sign-in").listeners.click();
  assert.equal(c.elements.get("sign-in").disabled, true);
  assert.equal(c.elements.get("cancel").disabled, true);
  assert.equal(c.elements.get("status").dataset.code, "callback_rejected");
  assert.match(c.elements.get("detail").textContent, /Return to iTunes.*Reconnect/);
  await c.elements.get("sign-in").listeners.click();
  assert.equal(posts, 1);
  assert.equal(c.history.length, 1);
});

test("sign-in failures identify the fixed stage without exposing SDK or callback error details", async () => {
  const privateError = `PRIVATE_SDK_ERROR_${token}`;
  for (const [failure, expected] of [
    ["authorize", "authentication_failed"], ["token", "authorization_missing"],
    ["network", "callback_unreachable"], ["expired", "callback_expired"], ["malformed", "callback_rejected"],
  ]) {
    const music = { authorize: async () => { if (failure === "authorize") throw new Error(privateError); },
      musicUserToken: failure === "token" ? "" : token };
    const c = context({ music, fetch: async url => {
      if (url.startsWith(`${ORIGIN}/itunes-auth/developer-token.json?`)) return { ok: true, json: async () => createPublicToken({ env }) };
      if (failure === "network") throw new TypeError(privateError);
      if (failure === "expired") return { ok: false, status: 409, json: async () => ({ ok: false }) };
      return { ok: true, json: async () => { throw new Error(privateError); } };
    } });
    c.runAuth(); await settle();
    await c.elements.get("sign-in").listeners.click();
    assert.equal(c.elements.get("status").dataset.code, expected);
    const visible = [...c.elements.values()].map(element => element.textContent).join(" ");
    assert(!visible.includes(privateError) && !visible.includes(token));
    if (expected.startsWith("callback_")) {
      assert.match(visible, /Return to iTunes.*Reconnect/);
      assert.equal(c.elements.get("sign-in").disabled, true);
    } else assert.equal(c.elements.get("sign-in").disabled, false);
  }
});

test("callback timeout permits sixty seconds for the local-network permission decision and emits only a fixed code", async () => {
  const delays = [];
  const c = context({ timers: {
    setTimeout(callback, delay) { delays.push(delay); queueMicrotask(callback); return 1; }, clearTimeout() {},
  }, fetch: async (_url, options) => new Promise((_, reject) => {
    options.signal.addEventListener("abort", () => reject(new Error(token)));
  }) });
  await assert.rejects(c.window.TunesMusicKitBootstrap.postHandoff(callback, { state, music_user_token: token }),
    error => error.code === "callback_timeout" && !error.message.includes(token));
  assert.deepEqual(delays, [60000]);
});

test("fresh public JWT validation rejects stale, wrong-origin, or altered metadata before configure", () => {
  const c = context();
  const document = createPublicToken({ env, nowSeconds: 1800000000 });
  const validate = c.window.TunesMusicKitBootstrap.validateDeveloperToken;
  assert.equal(validate(document, 1800000001), document.developerToken);
  assert.throws(() => validate(document, 1800086400));
  assert.throws(() => validate({ ...document, origins: ["https://other.example"] }, 1800000001));
  assert.throws(() => validate({ ...document, expiresAt: document.expiresAt + 1 }, 1800000001));
});

test("normal browser player has no authorization, token request, or playback activity", async () => {
  const c = context({ url: `${ORIGIN}/itunes-player/` });
  await c.runPlayer();
  assert.equal(c.calls.length, 0);
  assert.equal(c.reports.length, 0);
});

function playerMusic({ rejectStorefront = false, rejectAuthorize = false } = {}) {
  const calls = [];
  let delegate;
  const prototype = { set requestUserToken(value) { delegate = value; } };
  const music = Object.create(prototype);
  music.isAuthorized = false;
  music.authorize = async () => {
    calls.push("authorize");
    if (rejectAuthorize) throw new Error("secret details must stay private");
    assert.equal(await delegate(), token);
    music.isAuthorized = true;
  };
  music.api = { music: async route => { calls.push(route); if (rejectStorefront) throw new Error(token); return { data: { data: [{ id: "gb" }] } }; } };
  return { music, calls };
}

test("Electron player uses the inherited token-request setter and reports ready only after Apple validation", async () => {
  const { music, calls } = playerMusic();
  let requests = 0;
  const c = context({ url: `${ORIGIN}/itunes-player/`, music, bridge: { requestAppleToken: async () => { requests++; return token; } } });
  await c.runPlayer();
  assert.equal(requests, 1);
  assert.deepEqual(calls, ["authorize", "/v1/me/storefront"]);
  assert.deepEqual(plain(c.reports), [{ type: "apple_player_ready" }]);
  assert(!c.calls.some(([url]) => url.includes(token)));
});

test("missing SDK delegate setter fails closed before authorize or bridge token request", async () => {
  let authorized = false, requested = false;
  const c = context({ url: `${ORIGIN}/itunes-player/`, music: { authorize: async () => { authorized = true; } },
    bridge: { requestAppleToken: async () => { requested = true; return token; } } });
  await c.runPlayer();
  assert.equal(authorized, false); assert.equal(requested, false);
  assert.deepEqual(plain(c.reports), [{ type: "apple_player_error", code: "unsupported_version" }]);
});

test("rejected authorization or personal API validation emits only a fixed reauthorization error", async () => {
  for (const options of [{ rejectAuthorize: true }, { rejectStorefront: true }]) {
    const { music } = playerMusic(options);
    const c = context({ url: `${ORIGIN}/itunes-player/`, music, bridge: { requestAppleToken: async () => token } });
    await c.runPlayer();
    assert.deepEqual(plain(c.reports), [{ type: "apple_player_error", code: "reauth_required" }]);
    assert(!JSON.stringify(c.reports).includes(token));
  }
});

test("standalone refresh builds and deploys with six-hour renewal and never invokes the article publisher", () => {
  const workflow = fs.readFileSync(path.join(__dirname, "../.github/workflows/refresh-musickit.yml"), "utf8");
  assert(workflow.includes("17 */6 * * *"));
  assert(workflow.includes("run: npm run build"));
  assert(workflow.includes("run: node scripts/build-musickit-public-token.cjs"));
  assert(!/run:\s*(?:[^\n]*\n\s*)?npm run blog:publish/.test(workflow));
  assert(workflow.includes("group: pages"));
  const deploy = fs.readFileSync(path.join(__dirname, "../.github/workflows/deploy.yml"), "utf8");
  assert(deploy.indexOf("run: npm run build") < deploy.indexOf("run: node scripts/build-musickit-public-token.cjs"));
});


test("cached authorization cannot bypass the owned delegate on a player reconnect", async () => {
  const { music } = playerMusic();
  music.isAuthorized = true;
  music.authorize = async () => token;
  let requested = false;
  const c = context({ url: `${ORIGIN}/itunes-player/`, music, bridge: { requestAppleToken: async () => { requested = true; return token; } } });
  await c.runPlayer();
  assert.equal(requested, false);
  assert.deepEqual(plain(c.reports), [{type: "apple_player_error", code: "reauth_required"}]);
});
