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
    status.textContent = "Opening Apple sign-in…";
    try {
      const music = preparedMusic;
      // Configuration is already complete so Apple's popup starts in this click.
      await music.authorize();
      if (attempt !== generation) return;
      const token = music.musicUserToken;
      if (!bootstrap.validUserToken(token)) throw new Error("authorization_failed");
      status.textContent = "Connecting to iTunes…";
      await bootstrap.postHandoff(handoff.callback, { state: handoff.state, music_user_token: token });
      if (attempt !== generation) return;
      finished = true;
      cancel.disabled = true;
      status.textContent = "Apple Music is connected. Return to iTunes.";
      detail.textContent = "You can close this page.";
    } catch {
      if (attempt !== generation) return;
      signIn.disabled = false;
      status.textContent = "The connection did not finish. You can try again.";
      detail.textContent = "Allow the Apple sign-in popup and, if your browser asks, access to the iTunes app on this computer. Keep iTunes open while connecting.";
    }
  });

  cancel.addEventListener("click", async () => {
    if (finished || cancel.disabled) return;
    const attempt = ++generation;
    signIn.disabled = true;
    cancel.disabled = true;
    try {
      await bootstrap.postHandoff(handoff.callback, { state: handoff.state, cancelled: true });
      if (attempt !== generation) return;
      finished = true;
      status.textContent = "Connection cancelled. Return to iTunes.";
      detail.textContent = "You can close this page.";
    } catch {
      if (attempt !== generation) return;
      signIn.disabled = false;
      cancel.disabled = false;
      status.textContent = "iTunes could not be reached.";
      detail.textContent = "Return to iTunes to cancel the connection, or keep iTunes open and try again.";
    }
  });
  prepare();
})(window);
