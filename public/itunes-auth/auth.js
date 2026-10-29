(function (root) {
  "use strict";
  const bootstrap = root.TunesMusicKitBootstrap;
  const status = root.document.getElementById("status");
  const detail = root.document.getElementById("detail");
  const signIn = root.document.getElementById("sign-in");
  const cancel = root.document.getElementById("cancel");
  let handoff;
  let generation = 0;
  let finished = false;
  let preparedMusic;
  let authorizationAttempt;
  const sdkCodes = new Set(["ACCESS_DENIED", "AGE_GATE", "AUTHORIZATION_ERROR", "CONFIGURATION_ERROR",
    "DEVICE_LIMIT", "GEO_BLOCK", "INTERNAL_ERROR", "INVALID_ARGUMENTS", "NETWORK_ERROR",
    "UNKNOWN_ERROR", "UNSUPPORTED_ERROR", "USER_INTERACTION_REQUIRED"]);
  const popupMethods = new Set(["authorize", "close", "decline", "switchUserId", "thirdPartyInfo", "unavailable"]);
  const callbackCodes = new Set(["callback_timeout", "callback_unreachable", "callback_rejected", "callback_expired"]);
  const failures = {
    authentication_failed: ["Apple sign-in did not finish.", "Allow Apple’s sign-in popup, complete sign-in and consent, then try again."],
    authorization_validation_failed: ["Apple sign-in finished, but Apple Music validation failed.", "Apple Music did not validate the authorization. Try signing in again."],
    authorization_missing: ["Apple sign-in finished without an Apple Music authorization.", "Try signing in again and allow this app to access Apple Music."],
    callback_timeout: ["Apple sign-in finished, but the return to iTunes timed out.", "Allow access to the iTunes app on this computer if your browser asks. Return to iTunes and choose Reconnect to start a fresh request."],
    callback_unreachable: ["Apple sign-in finished, but iTunes could not be reached.", "Keep iTunes open and allow local-network access if your browser asks. Return to iTunes and choose Reconnect to start a fresh request."],
    callback_rejected: ["Apple sign-in finished, but iTunes did not accept the return request.", "Return to iTunes and choose Reconnect to start a fresh request."],
    callback_expired: ["This connection request has expired or was already used.", "Return to iTunes and choose Reconnect. This page cannot reuse the old request."],
  };

  function safeSdkCode(error) {
    // Read only the SDK's enum fields, never messages, response data or stacks.
    for (const field of ["errorCode", "reason", "name"]) {
      try { const code = error?.[field]; if (sdkCodes.has(code)) return code; } catch {}
    }
    return "UNKNOWN";
  }

  function showFailure(code) {
    status.dataset.code = code;
    [status.textContent, detail.textContent] = failures[code];
    // A closed listener and browser access denial look identical to Fetch.
    // Do not keep offering the same possibly expired callback/state pair.
    if (callbackCodes.has(code)) {
      finished = true;
      signIn.disabled = true;
      cancel.disabled = true;
    } else signIn.disabled = false;
  }

  try {
    handoff = bootstrap.readHandoff(root.location);
    root.history.replaceState(null, "", "/itunes-auth/");
    status.textContent = "Preparing Apple sign-in…";
    cancel.disabled = false;
  } catch {
    // Invalid requests never initialize MusicKit or send a callback.
    status.textContent = "Open Apple Music Connect from the iTunes client.";
    detail.textContent = "This sign-in request is missing or no longer valid. Return to iTunes and choose Connect again.";
    return;
  }

  root.addEventListener("message", event => {
    const attempt = authorizationAttempt;
    if (!attempt?.authorizing || attempt.generation !== generation) return;
    try {
      if (event.origin !== "https://authorize.music.apple.com") return;
      const data = event.data;
      if (!data || typeof data !== "object" || data.jsonrpc !== "2.0") return;
      const method = data.method;
      if (!popupMethods.has(method)) return;
      // Method names only: never inspect RPC parameters, results, errors or IDs.
      attempt.popupEvents.push(method);
      if (attempt.popupEvents.length > 8) attempt.popupEvents.shift();
      status.dataset.popupEvents = attempt.popupEvents.join(",");
    } catch {}
  });

  async function prepare() {
    const attempt = ++generation;
    signIn.disabled = true;
    delete status.dataset.code;
    delete status.dataset.sdkCode;
    delete status.dataset.popupEvents;
    status.textContent = "Preparing Apple sign-in…";
    try {
      const music = await bootstrap.configure();
      if (attempt !== generation) return;
      preparedMusic = music;
      if (typeof music.addEventListener === "function") {
        music.addEventListener("authorizationStatusDidChange", event => {
          if (authorizationAttempt?.generation === generation && authorizationAttempt.music === music
              && event?.authorizationStatus === 3) authorizationAttempt.sawAuthorized = true;
        });
      }
      signIn.textContent = "Sign In";
      signIn.disabled = false;
      status.textContent = "Ready to connect to iTunes.";
    } catch {
      if (attempt !== generation) return;
      signIn.textContent = "Try Again";
      signIn.disabled = false;
      status.textContent = "Apple sign-in could not be prepared.";
      detail.textContent = "Keep iTunes open and try again. After preparation finishes, choose Sign In to open Apple’s sign-in window.";
    }
  }

  signIn.addEventListener("click", async () => {
    if (finished || signIn.disabled) return;
    if (!preparedMusic) return prepare();
    const attempt = ++generation;
    signIn.disabled = true;
    cancel.disabled = false;
    delete status.dataset.code;
    delete status.dataset.sdkCode;
    status.dataset.popupEvents = "";
    status.textContent = "Opening Apple sign-in…";
    let stage = "authentication_failed";
    const observation = { generation: attempt, music: preparedMusic, sawAuthorized: false, authorizing: true, popupEvents: [] };
    authorizationAttempt = observation;
    try {
      const music = preparedMusic;
      // Configuration is already complete so Apple's popup starts in this click.
      await music.authorize();
      observation.authorizing = false;
      if (attempt !== generation) return;
      stage = "authorization_missing";
      const token = music.musicUserToken;
      if (!bootstrap.validUserToken(token)) throw new Error("authorization_failed");
      // authorize() can return a browser-cached grant without checking it.
      // Validate through the owning SDK before forwarding it to a new client.
      stage = "authorization_validation_failed";
      try { await music.api.music("/v1/me/storefront"); }
      catch (error) {
        try { await music.unauthorize(); } catch {}
        throw error;
      }
      stage = "callback_unreachable";
      status.textContent = "Connecting to iTunes…";
      await bootstrap.postHandoff(handoff.callback, { state: handoff.state, music_user_token: token });
      if (attempt !== generation) return;
      finished = true;
      cancel.disabled = true;
      status.textContent = "Apple Music is connected. Return to iTunes.";
      detail.textContent = "You can close this page.";
    } catch (error) {
      if (attempt !== generation) return;
      const code = stage === "authentication_failed" && observation.sawAuthorized ? "authorization_validation_failed"
        : stage === "callback_unreachable" && callbackCodes.has(error?.code) ? error.code : stage;
      if (stage === "authentication_failed") status.dataset.sdkCode = safeSdkCode(error);
      showFailure(code);
    } finally {
      observation.authorizing = false;
      if (authorizationAttempt === observation) authorizationAttempt = undefined;
    }
  });

  cancel.addEventListener("click", async () => {
    if (finished || cancel.disabled) return;
    const attempt = ++generation;
    signIn.disabled = true;
    cancel.disabled = true;
    delete status.dataset.code;
    delete status.dataset.sdkCode;
    try {
      await bootstrap.postHandoff(handoff.callback, { state: handoff.state, cancelled: true });
      if (attempt !== generation) return;
      finished = true;
      status.textContent = "Connection cancelled. Return to iTunes.";
      detail.textContent = "You can close this page.";
    } catch (error) {
      if (attempt !== generation) return;
      showFailure(callbackCodes.has(error?.code) ? error.code : "callback_unreachable");
      status.textContent = "This page could not cancel the connection in iTunes.";
    }
  });
  prepare();
})(window);
