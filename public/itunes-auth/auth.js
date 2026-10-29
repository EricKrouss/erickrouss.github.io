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
  const callbackCodes = new Set(["callback_timeout", "callback_unreachable", "callback_rejected", "callback_expired"]);
  const failures = {
    authentication_failed: ["Apple sign-in did not finish.", "Allow Apple’s sign-in popup, complete sign-in and consent, then try again."],
    authorization_missing: ["Apple sign-in finished without an Apple Music authorization.", "Try signing in again and allow this app to access Apple Music."],
    callback_timeout: ["Apple sign-in finished, but the return to iTunes timed out.", "Allow access to the iTunes app on this computer if your browser asks. Return to iTunes and choose Reconnect to start a fresh request."],
    callback_unreachable: ["Apple sign-in finished, but iTunes could not be reached.", "Keep iTunes open and allow local-network access if your browser asks. Return to iTunes and choose Reconnect to start a fresh request."],
    callback_rejected: ["Apple sign-in finished, but iTunes did not accept the return request.", "Return to iTunes and choose Reconnect to start a fresh request."],
    callback_expired: ["This connection request has expired or was already used.", "Return to iTunes and choose Reconnect. This page cannot reuse the old request."],
  };

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

  async function prepare() {
    const attempt = ++generation;
    signIn.disabled = true;
    delete status.dataset.code;
    status.textContent = "Preparing Apple sign-in…";
    try {
      const music = await bootstrap.configure();
      if (attempt !== generation) return;
      preparedMusic = music;
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
    status.textContent = "Opening Apple sign-in…";
    let stage = "authentication_failed";
    try {
      const music = preparedMusic;
      // Configuration is already complete so Apple's popup starts in this click.
      await music.authorize();
      if (attempt !== generation) return;
      stage = "authorization_missing";
      const token = music.musicUserToken;
      if (!bootstrap.validUserToken(token)) throw new Error("authorization_failed");
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
      showFailure(stage === "callback_unreachable" && callbackCodes.has(error?.code) ? error.code : stage);
    }
  });

  cancel.addEventListener("click", async () => {
    if (finished || cancel.disabled) return;
    const attempt = ++generation;
    signIn.disabled = true;
    cancel.disabled = true;
    delete status.dataset.code;
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
