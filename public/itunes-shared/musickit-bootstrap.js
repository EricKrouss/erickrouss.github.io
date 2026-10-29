(function (root) {
  "use strict";

  const ORIGIN = "https://erickrouss.github.io";
  const SDK_URL = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
  const TOKEN_URL = `${ORIGIN}/itunes-auth/developer-token.json`;
  const NONCE = /^[A-Za-z0-9_-]{43}$/;
  let sdkPromise;

  function validateCallback(value) {
    if (typeof value !== "string") throw new Error("invalid_callback");
    const match = /^http:\/\/127\.0\.0\.1:([1-9][0-9]{3,4})\/callback\/([A-Za-z0-9_-]{43})$/.exec(value);
    if (!match || Number(match[1]) < 1024 || Number(match[1]) > 65535) throw new Error("invalid_callback");
    return value;
  }

  function readHandoff(location) {
    if (location.origin !== ORIGIN || location.pathname !== "/itunes-auth/") throw new Error("invalid_handoff");
    const params = new URLSearchParams(location.search);
    if (params.getAll("callback").length !== 1 || params.getAll("state").length !== 1
        || [...params.keys()].some(key => key !== "callback" && key !== "state") || location.hash) {
      throw new Error("invalid_handoff");
    }
    const state = params.get("state");
    if (!NONCE.test(state)) throw new Error("invalid_handoff");
    return { callback: validateCallback(params.get("callback")), state };
  }

  function validUserToken(value) {
    return typeof value === "string" && /^[\x21-\x7e]{1,8192}$/.test(value);
  }

  function callbackError(code) {
    const error = new Error("The iTunes callback did not complete.");
    error.code = code;
    return error;
  }

  async function postHandoff(callback, payload) {
    validateCallback(callback);
    if (!payload || !NONCE.test(payload.state)
        || !(Object.keys(payload).length === 2 && (payload.cancelled === true || validUserToken(payload.music_user_token)))) {
      throw new Error("invalid_handoff");
    }
    const controller = new AbortController();
    let timedOut = false;
    // The first request may wait for Chrome's local-network permission prompt.
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 60000);
    try {
      let response;
      try {
        response = await root.fetch(callback, {
          method: "POST", mode: "cors", credentials: "omit", redirect: "error", cache: "no-store",
          headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal,
        });
      } catch {
        throw callbackError(timedOut ? "callback_timeout" : "callback_unreachable");
      }
      if (!response.ok) {
        throw callbackError([404, 409, 410].includes(response.status) ? "callback_expired" : "callback_rejected");
      }
      let body;
      try { body = await response.json(); } catch {
        throw callbackError(timedOut ? "callback_timeout" : "callback_rejected");
      }
      if (!body || body.ok !== true) throw callbackError("callback_rejected");
    } finally { clearTimeout(timeout); }
  }

  function parsePart(value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid_developer_token");
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(root.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
  }

  function validateDeveloperToken(document, now = Math.floor(Date.now() / 1000)) {
    if (!document || document.schemaVersion !== 1 || typeof document.developerToken !== "string") throw new Error("invalid_developer_token");
    const parts = document.developerToken.split(".");
    if (parts.length !== 3 || !/^[A-Za-z0-9_-]{86}$/.test(parts[2])) throw new Error("invalid_developer_token");
    const header = parsePart(parts[0]);
    const claims = parsePart(parts[1]);
    if (header.alg !== "ES256" || !/^[A-Z0-9]{10}$/.test(header.kid) || header.kid !== document.keyId
        || !/^[A-Z0-9]{10}$/.test(claims.iss) || claims.iss !== document.teamId
        || !Number.isSafeInteger(claims.iat) || !Number.isSafeInteger(claims.exp)
        || claims.iat > now + 60 || claims.exp <= now + 60 || claims.exp - claims.iat !== 86400
        || document.issuedAt !== claims.iat || document.expiresAt !== claims.exp
        || !Array.isArray(claims.origin) || claims.origin.length !== 1 || claims.origin[0] !== ORIGIN
        || !Array.isArray(document.origins) || document.origins.length !== 1 || document.origins[0] !== ORIGIN) {
      throw new Error("invalid_developer_token");
    }
    return document.developerToken;
  }

  async function freshDeveloperToken() {
    const response = await root.fetch(`${TOKEN_URL}?t=${Date.now()}`, {
      credentials: "omit", cache: "no-store", redirect: "error",
    });
    if (!response.ok) throw new Error("developer_token_unavailable");
    return validateDeveloperToken(await response.json());
  }

  function loadMusicKit() {
    if (root.MusicKit && typeof root.MusicKit.configure === "function") return Promise.resolve(root.MusicKit);
    if (!sdkPromise) sdkPromise = new Promise((resolve, reject) => {
      const script = root.document.createElement("script");
      let timeout;
      const cleanup = () => {
        clearTimeout(timeout);
        root.document.removeEventListener("musickitloaded", ready);
        script.removeEventListener("load", ready);
        script.removeEventListener("error", failed);
      };
      const ready = () => {
        if (!root.MusicKit || typeof root.MusicKit.configure !== "function") return;
        cleanup();
        resolve(root.MusicKit);
      };
      const failed = () => { cleanup(); sdkPromise = undefined; script.remove(); reject(new Error("sdk_unavailable")); };
      script.src = SDK_URL;
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.addEventListener("load", ready);
      script.addEventListener("error", failed);
      root.document.addEventListener("musickitloaded", ready);
      timeout = setTimeout(failed, 20000);
      root.document.head.appendChild(script);
    });
    return sdkPromise;
  }

  async function configure() {
    if (root.location.origin !== ORIGIN) throw new Error("invalid_origin");
    const [developerToken, MusicKit] = await Promise.all([freshDeveloperToken(), loadMusicKit()]);
    await MusicKit.configure({ developerToken, app: { name: "iTunes for Linux", build: "1.0.0" } });
    const music = MusicKit.getInstance();
    if (!music) throw new Error("sdk_unavailable");
    return music;
  }

  root.TunesMusicKitBootstrap = Object.freeze({ ORIGIN, SDK_URL, TOKEN_URL, readHandoff, validateCallback,
    validUserToken, postHandoff, validateDeveloperToken, configure });
})(window);
