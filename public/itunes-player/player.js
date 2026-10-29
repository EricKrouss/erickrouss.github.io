(async function (root) {
  "use strict";
  const bridge = root.tunesPlayerBridge;
  if (!bridge || typeof bridge.requestAppleToken !== "function" || typeof bridge.report !== "function") return;
  const status = root.document.getElementById("status");
  const bootstrap = root.TunesMusicKitBootstrap;
  let code = "bootstrap_failed";
  try {
    if (root.location.pathname !== "/itunes-player/" || root.location.search || root.location.hash) throw new Error("invalid_player");
    status.textContent = "Preparing Apple Music…";
    const music = await bootstrap.configure();
    let prototype = music;
    let tokenDelegate;
    for (let depth = 0; prototype && depth < 8; depth++, prototype = Object.getPrototypeOf(prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, "requestUserToken");
      if (descriptor) { tokenDelegate = descriptor.set; break; }
    }
    if (typeof tokenDelegate !== "function") {
      code = "unsupported_version";
      throw new Error("unsupported_version");
    }
    code = "reauth_required";
    let delegateRequested = false;
    music.requestUserToken = async () => {
      delegateRequested = true;
      const token = await bridge.requestAppleToken();
      if (!bootstrap.validUserToken(token)) throw new Error("invalid_user_token");
      return token;
    };
    await music.authorize();
    if (!delegateRequested || !music.isAuthorized) throw new Error("authorization_failed");
    await music.api.music("/v1/me/storefront");
    status.textContent = "Apple Music is ready in iTunes.";
    bridge.report({ type: "apple_player_ready" });
  } catch {
    status.textContent = code === "reauth_required" ? "Reconnect Apple Music from iTunes." : "Apple Music could not be prepared. Try again from iTunes.";
    bridge.report({ type: "apple_player_error", code });
  }
})(window);
