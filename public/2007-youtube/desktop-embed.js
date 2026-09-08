// Adapt Eric's original watch page to a desktop window; retain its player code.
(() => {
  const notifyFocus = () => {
    if (parent !== window)
      parent.postMessage({ type: "eric-player-focus" }, location.origin);
  };
  document.addEventListener("pointerdown", notifyFocus);
  document.addEventListener("focusin", notifyFocus);
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (event.data?.type === "eric-desktop-pause") {
      if (typeof providerPause === "function") providerPause();
      document
        .querySelectorAll("video,audio")
        .forEach((media) => media.pause());
    }
    if (event.data?.type === "eric-desktop-search")
      document.getElementById("ytUrlInput")?.focus();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && typeof providerPause === "function") providerPause();
  });
  const adapt = () => {
    if (innerWidth >= 780 || document.fullscreenElement) return;
    const width = Math.min(450, innerWidth - 16);
    const height = Math.round((width * 339) / 450);
    const set = (selector, properties) =>
      document.querySelectorAll(selector).forEach((el) => {
        for (const [name, value] of Object.entries(properties))
          el.style.setProperty(name, value, "important");
      });
    set(".watch-layout", {
      "grid-template-columns": "minmax(0, 1fr)",
      width: "100%",
    });
    set(
      ".watch-left,.watch-mid,.watch-player-frame,#actionsAndStatsDiv,.actionsMatrix",
      { width: "100%", "max-width": "100%" },
    );
    set(".player-container,.bottom-bar", {
      width: width + "px",
      "max-width": "100%",
    });
    set(".video-area,#myVideo,#ytContainer,#ytContainer iframe", {
      width: width + "px",
      height: height + "px",
      "min-width": "0",
      "min-height": "0",
    });
    if (typeof syncYouTubePlayerBox === "function")
      syncYouTubePlayerBox(width, height);
  };
  for (const name of [
    "enforceWatchClassicWindowedBox",
    "enforceWatchTheaterWindowedBox",
  ]) {
    const original = window[name];
    if (typeof original === "function")
      window[name] = (...args) => {
        original(...args);
        adapt();
      };
  }
  window.addEventListener("resize", adapt);
  document.addEventListener("DOMContentLoaded", adapt);
  document.addEventListener("fullscreenchange", () =>
    requestAnimationFrame(adapt),
  );
  adapt();
  for (const [id, label] of [
    ["playPauseBtn", "Play or pause"],
    ["rewindBtn", "Rewind"],
    ["volumeBtn", "Volume"],
    ["fullscreenBtn", "Full screen"],
    ["theaterBtn", "Theater mode"],
  ]) {
    document.getElementById(id)?.setAttribute("aria-label", label);
  }
})();
