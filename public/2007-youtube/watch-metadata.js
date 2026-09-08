// Keep live video metadata separate from the explicitly fictional comment thread.
(() => {
  const $ = (id) => document.getElementById(id);
  let requestNumber = 0;
  const fetchJson = async (url) => {
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error("Metadata unavailable");
    return r.json();
  };
  function setLinks(id) {
    const url = "https://www.youtube.com/watch?v=" + id;
    $("vi-url").value = url;
    $("vi-embed").value =
      '<object width="425" height="350"><param name="movie" value="https://www.youtube.com/v/' +
      id +
      '"></param><embed src="https://www.youtube.com/v/' +
      id +
      '" type="application/x-shockwave-flash" width="425" height="350"></embed></object>';
    for (const name of ["vi-channel", "vi-provider"]) $(name).href = url;
  }
  function showMetadata(meta, id) {
    if (meta.title) {
      $("vi-title-left").textContent = meta.title;
      document.title = "YouTube - " + meta.title;
    }
    const author = meta.author_name || meta.uploader;
    if (author)
      for (const name of ["vi-channel", "vi-provider", "vi-subscribe-channel"])
        $(name).textContent = author;
    // Only a verified HTTPS YouTube channel URL is exposed as a link.
    try {
      const u = new URL(meta.author_url);
      if (u.protocol === "https:" && /(^|\.)youtube\.com$/.test(u.hostname))
        for (const name of ["vi-channel", "vi-provider"]) $(name).href = u.href;
    } catch {}
    if (meta.description) {
      const doc = new DOMParser().parseFromString(
        meta.description,
        "text/html",
      );
      $("vi-description").textContent = doc.body.textContent;
      $("vi-description").classList.add("collapsed");
      $("descMore").hidden = false;
      $("descMore").textContent = "(more)";
    }
    if (meta.views != null)
      $("vd-views").textContent = Number(meta.views).toLocaleString("en-US");
    if (meta.uploadDate) {
      const d = new Date(meta.uploadDate);
      if (!Number.isNaN(d.getTime()))
        $("vi-added").textContent = d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
    }
    if (meta.category) $("vi-category").textContent = meta.category;
    if (Array.isArray(meta.tags)) {
      $("vi-tags").replaceChildren();
      for (const tag of meta.tags.slice(0, 8)) {
        const span = document.createElement("span");
        span.textContent = String(tag) + " ";
        $("vi-tags").append(span);
      }
    }
  }
  async function populate(id) {
    const request = ++requestNumber;
    setLinks(id);
    $("vi-title-left").textContent = "YouTube video";
    $("vi-description").textContent = "Video information is loading...";
    for (const name of [
      "vi-channel",
      "vi-provider",
      "vi-subscribe-channel",
      "vi-added",
      "vi-category",
      "vd-views",
      "vd-favs",
    ])
      $(name).textContent = "—";
    $("vi-tags").replaceChildren();
    $("descMore").hidden = true;
    // oEmbed is YouTube's title/author endpoint; optional Piped data fills the old info panel.
    const [basic, extra] = await Promise.allSettled([
      fetchJson(
        "https://www.youtube.com/oembed?url=" +
          encodeURIComponent("https://www.youtube.com/watch?v=" + id) +
          "&format=json",
      ),
      fetchJson(
        "https://api.piped.private.coffee/streams/" + encodeURIComponent(id),
      ),
    ]);
    if (request !== requestNumber) return;
    $("vi-description").textContent =
      "Description unavailable. Open the video on YouTube for more information.";
    if (basic.status === "fulfilled") showMetadata(basic.value, id);
    if (extra.status === "fulfilled") showMetadata(extra.value, id);
    if (basic.status === "rejected" && extra.status === "rejected")
      $("vi-title-left").textContent = "YouTube video: " + id;
  }
  $("ytLoaderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const link = $("ytUrlInput").value.trim(),
      id = extractYouTubeId(link);
    if (!id) {
      $("ytInputError").textContent =
        "Paste a YouTube video URL (youtube.com or youtu.be).";
      $("ytUrlInput").focus();
      return;
    }
    $("ytInputError").replaceChildren();
    window.dispatchEvent(
      new CustomEvent("watch-video-change", { detail: { id } }),
    );
    populate(id);
    startLoadingAnimation();
    try {
      await enterYouTubeMode(id, extractStartSeconds(link) || 0);
    } catch {
      window.dispatchEvent(
        new CustomEvent("watch-playback-error", { detail: { id } }),
      );
    }
  });
  window.addEventListener("watch-playback-error", (event) => {
    stopLoadingAnimation();
    const id = event.detail.id;
    $("ytInputError").replaceChildren(
      document.createTextNode("This video could not play here. "),
    );
    const link = document.createElement("a");
    link.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Watch on YouTube";
    $("ytInputError").append(link);
  });
  const initial = typeof ytVideoId !== "undefined" ? ytVideoId : null;
  if (initial) populate(initial);
  else setLinks("KmtzQCSh6xk");
})();
