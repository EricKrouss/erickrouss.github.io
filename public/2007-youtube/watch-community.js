// Fictional viewers; no comments, votes, or account actions are sent to YouTube.
(() => {
  const $ = (id) => document.getElementById(id);
  const asset = (name) => "assets/archive-2007/" + name;
  const universal = [
    ["mattman_92", "lol", 24],
    ["xxSk8erMikeXX", "how do u download this?", 18],
    ["ashleyxox07", "my brother sent me this haha", 12],
    ["supermariofan64", "5/5", 8],
    [
      "kevinator3000",
      "wait why does the windows thing have linux commands",
      31,
    ],
    ["joshua1988", "can you put it on rapidshare?", 6],
    ["xXfirstPostXx", "first!!!", -2],
    ["daniel1989", "it keeps stopping halfway through for me", 15],
    ["katie_1989", "putting this on my myspace", 9],
    ["abc123whatever", "nice", 4],
    ["ChRiS_07", "does anyone know how to make it fullscreen", 13],
    ["xXdarklinkXx", "who keeps rating everything 1 star", 7],
    ["alex_is_bored", "I sent this to like 6 people already", 21],
    ["guitardude54", "no sound??\nedit: nvm", 17],
    ["penguinzrule", "linux ftw", 22],
    ["ryan234234", "works fine for me", 3],
    ["sarahh_x", "hahaha", 11],
    ["james1990", "saved to favorites", 5],
    ["soccerkid12", "ive watched this like 10 times now", 16],
    ["linuxdude88", "IE on linux? lol", 26],
    ["aLiCe_xx", "why are people arguing down there", 10],
    ["Nick_182", "took ages to load but worth it", 14],
    ["animegirl93", ":D", 7],
    ["bballer_24", "anyone got a better quality version?", 19],
    ["jacksonM", "Nice one. 5 stars.", 23],
    ["xxpunkrockxx", "THIS IS AWESOME", 2],
    ["dave12345", "ok back to homework", 8],
    ["t0mmyboy", "lol the comments", 20],
  ];
  const numa = [
    ["crazydude123", "LOL his face at the start", 42],
    ["lauren_x3", "i cant stop doing the arm thing", 35],
    ["mike8910", "whats the name of the song??", 27],
    ["dan_the_man06", "Dragostea Din Tei by O-Zone", 22],
    ["xXLeahXx", "MY DAD DOES THIS", 38],
    [
      "sonicfan1992",
      "this is the original right? theres like 20 copies on here",
      17,
    ],
    [
      "jennybean_90",
      "me and my friend tried this and knocked the webcam over lol",
      29,
    ],
    ["rockon333", "haha the eyebrows", 31],
  ];
  const labels = [
    "Poor",
    "Nothing special",
    "Worth watching",
    "Pretty cool",
    "Awesome!",
  ];
  let videoId = new URLSearchParams(location.search).get("v") || "numa-demo";
  let page = 1,
    replyTo = null,
    data,
    comments;
  const perPage = 8;
  const isNuma = () => videoId === "numa-demo" || videoId === "KmtzQCSh6xk";
  function shuffled(items, seed) {
    let n = 2166136261;
    for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
    return items
      .map((value) => ({
        value,
        order: (n = (Math.imul(n, 1664525) + 1013904223) >>> 0),
      }))
      .sort((a, b) => a.order - b.order)
      .map((x) => x.value);
  }
  function readData() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("eric-yt2007:" + videoId) || "{}",
      );
      return {
        rating: [1, 2, 3, 4, 5].includes(saved.rating) ? saved.rating : 0,
        votes:
          saved.votes && typeof saved.votes === "object" ? saved.votes : {},
        replies: Array.isArray(saved.replies)
          ? saved.replies
              .filter(
                (r) =>
                  typeof r.id === "string" &&
                  typeof r.name === "string" &&
                  typeof r.text === "string",
              )
              .slice(0, 100)
          : [],
        favorite: !!saved.favorite,
        subscribed: !!saved.subscribed,
      };
    } catch {
      return {
        rating: 0,
        votes: {},
        replies: [],
        favorite: false,
        subscribed: false,
      };
    }
  }
  function save() {
    try {
      localStorage.setItem("eric-yt2007:" + videoId, JSON.stringify(data));
    } catch {
      notice(
        "Browser storage is unavailable. Changes will last until you close this page.",
      );
    }
  }
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function notice(text, value) {
    const box = $("watchNotice");
    box.hidden = false;
    box.replaceChildren(el("span", "", text));
    if (value) {
      const input = el("input");
      input.readOnly = true;
      input.value = value;
      input.setAttribute("aria-label", text);
      box.append(input);
      input.focus();
      input.select();
    }
  }
  function dialog(title, text) {
    $("dialogTitle").textContent = title;
    $("dialogText").textContent = text;
    $("siteDialog").showModal();
  }
  function score(c) {
    return (
      c.score + ([-1, 1].includes(data.votes[c.id]) ? data.votes[c.id] : 0)
    );
  }
  function showStars(preview) {
    const n = preview || data.rating || (isNuma() ? 4 : 0);
    [...$("starControls").children].forEach((button, i) => {
      button.firstChild.src = asset(
        i < n ? "icn_star_full_19x20.png" : "icn_star_empty_19x20.png",
      );
      button.setAttribute("aria-checked", String(data.rating === i + 1));
      button.tabIndex = (data.rating ? data.rating === i + 1 : i === 0)
        ? 0
        : -1;
    });
    $("ratingMessage").textContent = preview
      ? labels[preview - 1]
      : data.rating
        ? "Your rating: " + data.rating + "/5"
        : "Rate this video";
    $("vd-ratings").textContent = isNuma()
      ? 3026 + (data.rating ? 1 : 0) + " ratings"
      : data.rating
        ? "Thanks for rating!"
        : "No ratings yet";
  }
  for (let i = 1; i <= 5; i++) {
    const b = el("button", "starControl");
    b.type = "button";
    b.role = "radio";
    b.title = labels[i - 1];
    b.setAttribute("aria-label", i + " " + (i === 1 ? "star" : "stars"));
    const img = el("img");
    img.alt = "";
    img.width = 19;
    img.height = 20;
    b.append(img);
    b.addEventListener("mouseenter", () => showStars(i));
    b.addEventListener("focus", () => showStars(i));
    b.addEventListener("click", () => {
      data.rating = i;
      save();
      showStars();
    });
    b.addEventListener("keydown", (event) => {
      const key = event.key;
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(key)
      )
        return;
      event.preventDefault();
      const next =
        key === "Home"
          ? 1
          : key === "End"
            ? 5
            : Math.max(
                1,
                Math.min(
                  5,
                  i + (["ArrowLeft", "ArrowDown"].includes(key) ? -1 : 1),
                ),
              );
      data.rating = next;
      save();
      showStars();
      $("starControls").children[next - 1].focus();
    });
    $("starControls").append(b);
  }
  $("starControls").addEventListener("mouseleave", () => showStars());
  $("starControls").addEventListener("focusout", (event) => {
    if (!$("starControls").contains(event.relatedTarget)) showStars();
  });
  function openForm(parentId) {
    const original = data.replies.find((c) => c.id === parentId);
    replyTo = original?.parentId || parentId;
    const parentComment = [...comments, ...data.replies].find(
      (c) => c.id === parentId,
    );
    $("commentReplyLabel").textContent = parentComment
      ? "Reply to " + parentComment.name + ":"
      : "Your comment:";
    $("commentForm").hidden = false;
    $("commentText").focus();
  }
  function renderComment(c, isReply = false) {
    const entry = el(
      "article",
      isReply ? "commentEntry commentEntryReply" : "commentEntry",
    );
    entry.dataset.commentId = c.id;
    const head = el("div", "commentHead"),
      who = el("div", "commentAuthor"),
      name = el("a", "", c.name);
    name.href = "#viewer";
    name.addEventListener("click", (e) => {
      e.preventDefault();
      dialog(
        c.name,
        c.local
          ? "This comment was written in your browser."
          : "This is a fictional viewer for the demo.",
      );
    });
    const bold = el("b");
    bold.append(name);
    who.append(
      bold,
      el("span", "smallText", c.local ? " (just now)" : " (" + c.age + ")"),
    );
    head.append(who);
    const voting = el("div", "commentVote"),
      count = score(c);
    voting.append(
      el(
        "b",
        count > 0 ? "positiveScore" : count < 0 ? "negativeScore" : "",
        count > 0 ? "+" + count : count,
      ),
    );
    for (const [vote, label, filename] of [
      [-1, "Poor comment", "icn_comments_down_19x19.gif"],
      [1, "Good comment", "icn_comments_up_19x19.gif"],
    ]) {
      const b = el("button");
      b.type = "button";
      b.title = label;
      b.setAttribute("aria-label", label + " by " + c.name);
      b.setAttribute("aria-pressed", String(data.votes[c.id] === vote));
      const img = el("img");
      img.src = asset(filename);
      img.alt = "";
      b.append(img);
      b.addEventListener("click", () => {
        data.votes[c.id] = data.votes[c.id] === vote ? 0 : vote;
        save();
        renderComments();
      });
      voting.append(b);
    }
    head.append(voting);
    const actions = el("div", "commentAction"),
      reply = el("button", "", "Reply");
    reply.type = "button";
    reply.addEventListener("click", () => openForm(c.id));
    actions.append("(", reply, ")");
    entry.append(head, actions, el("div", "commentBody", c.text));
    return entry;
  }
  function renderComments() {
    const threshold = Number($("commentThreshold").value),
      all = [
        ...data.replies
          .filter((c) => !c.parentId)
          .map((c) => ({ ...c, score: 0, local: true })),
        ...comments,
      ];
    const filtered = all.filter((c) => score(c) >= threshold),
      pages = Math.max(1, Math.ceil(filtered.length / perPage));
    page = Math.min(page, pages);
    $("recent_comments").replaceChildren();
    for (const c of filtered.slice((page - 1) * perPage, page * perPage)) {
      $("recent_comments").append(renderComment(c));
      for (const r of data.replies.filter((r) => r.parentId === c.id))
        $("recent_comments").append(
          renderComment({ ...r, local: true, score: 0 }, true),
        );
    }
    if (!filtered.length)
      $("recent_comments").append(
        el("p", "", "No comments match this rating. Try “all comments.”"),
      );
    for (const id of ["commentPaginationTop", "commentPaginationBottom"]) {
      const left = el("span", "", "Page: "),
        right = el("span");
      const add = (container, label, n, current = false) => {
        const b = el("button", "", label);
        b.type = "button";
        b.setAttribute("aria-label", "Comments page " + n);
        if (current) b.setAttribute("aria-current", "page");
        b.addEventListener("click", () => {
          page = n;
          renderComments();
          $("commentsHeading").scrollIntoView({ block: "start" });
        });
        container.append(b);
      };
      for (let n = 1; n <= pages; n++) add(left, String(n), n, n === page);
      if (page > 1) add(right, "Previous", page - 1);
      if (page < pages) add(right, "Next", page + 1);
      $(id).replaceChildren(left, right);
    }
    $("vd-comments").textContent = comments.length + data.replies.length;
  }
  function loadVideo(id) {
    videoId = id;
    data = readData();
    page = 1;
    replyTo = null;
    $("commentForm").hidden = true;
    $("commentText").value = "";
    $("commentRemaining").textContent = "500 characters remaining";
    $("watchNotice").hidden = true;
    const pool = isNuma()
      ? [...numa, ...shuffled(universal, videoId).slice(0, 8)]
      : shuffled(universal, videoId).slice(0, 16);
    comments = pool.map(([name, text, score], i) => ({
      id: "fiction-" + universal.concat(numa).findIndex((c) => c[0] === name),
      name,
      text,
      score,
      age:
        i < 3
          ? i + 1 + (i === 0 ? " hour ago" : " hours ago")
          : i - 1 + " days ago",
    }));
    showStars();
    renderComments();
    updateSavedControls();
  }
  function updateSavedControls() {
    $("favoriteVideo").querySelector("span").textContent = data.favorite
      ? "Saved to Favorites"
      : "Save to Favorites";
    $("subscribeVideo").textContent = data.subscribed
      ? "Unsubscribe"
      : "Subscribe";
    $("subscribeVideo").setAttribute("aria-pressed", String(data.subscribed));
  }
  $("postTextComment").addEventListener("click", (e) => {
    e.preventDefault();
    openForm(null);
  });
  $("cancelComment").addEventListener("click", () => {
    $("commentForm").hidden = true;
    replyTo = null;
  });
  $("commentText").addEventListener("input", () => {
    $("commentRemaining").textContent =
      500 - $("commentText").value.length + " characters remaining";
  });
  $("commentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("commentText").value.trim(),
      name = $("commentName").value.trim();
    if (!text || !name) return;
    data.replies.unshift({
      id: crypto.randomUUID(),
      name: name.slice(0, 24),
      text: text.slice(0, 500),
      parentId: replyTo,
    });
    data.replies = data.replies.slice(0, 100);
    save();
    page = 1;
    if (replyTo) {
      const parentIndex = [
        ...data.replies.filter((c) => !c.parentId),
        ...comments,
      ].findIndex((c) => c.id === replyTo);
      if (parentIndex >= 0) page = Math.floor(parentIndex / perPage) + 1;
    }
    $("commentThreshold").value = "-1000";
    $("commentText").value = "";
    $("commentForm").hidden = true;
    renderComments();
  });
  $("commentThreshold").addEventListener("change", () => {
    page = 1;
    renderComments();
  });
  $("favoriteVideo").addEventListener("click", (e) => {
    e.preventDefault();
    data.favorite = !data.favorite;
    save();
    updateSavedControls();
  });
  $("subscribeVideo").addEventListener("click", () => {
    data.subscribed = !data.subscribed;
    save();
    updateSavedControls();
  });
  $("shareVideo").addEventListener("click", (e) => {
    e.preventDefault();
    notice("Copy this video link:", $("vi-url").value);
  });
  $("postVideo").addEventListener("click", (e) => {
    e.preventDefault();
    notice("Copy the classic embed code:", $("vi-embed").value);
  });
  $("descMore").addEventListener("click", (e) => {
    e.preventDefault();
    const collapsed = $("vi-description").classList.toggle("collapsed");
    $("descMore").textContent = collapsed ? "(more)" : "(less)";
  });
  for (const id of ["vi-url", "vi-embed"])
    $(id).addEventListener("click", () => $(id).select());
  const messages = {
    account: [
      "My Account",
      "No account needed here. Rate the video or leave a pretend comment. Everything stays in this browser.",
    ],
    history: [
      "Viewing History",
      "Your Internet Explorer history consists entirely of opening YouTube inside Internet Explorer inside a website.",
    ],
    help: [
      "Help",
      "Press Play for Numa Numa, or paste a YouTube video URL into Search. Stars, favorites, subscriptions and comments are local demo controls.",
    ],
    site: ["Site: Global", "One planet. Several incompatible video codecs."],
    upload: [
      "Upload Video",
      "Maximum file size: whatever fits on the CD-R in your desk drawer. This recreation does not accept uploads.",
    ],
    groups: [
      "Add to Groups",
      "You have been invited to “People Who Still Know Their MSN Password.” Membership pending since 2007.",
    ],
    flag: [
      "Flag as Inappropriate",
      "Reason: too much nostalgia for one browser window. Your imaginary report has been filed.",
    ],
    honors: [
      "Honors",
      "Most Viewed Video In This Particular Internet Explorer Window.",
    ],
    links: [
      "Sites Linking to This Video",
      "Eric’s Personal Computer — one extremely committed referral.",
    ],
    response: [
      "Post a video response",
      "Please locate your webcam driver CD. While you look for it, you can post a text comment.",
    ],
    tags: [
      "Video tags",
      "To play another video, paste its YouTube URL in the search box.",
    ],
    videos: [
      "Videos",
      "Choose a related video or paste a YouTube URL in Search.",
    ],
    categories: [
      "Categories",
      "Entertainment, Music, Computers & Technology, and Videos You Were Supposed To Stop Watching An Hour Ago.",
    ],
    channels: [
      "Channels",
      "All fictional viewers are currently busy customizing their channel backgrounds.",
    ],
    community: [
      "Community",
      "Welcome to the comments section. Please leave your caps lock at the door.",
    ],
  };
  document.querySelectorAll("[data-dialog]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      dialog(...(messages[a.dataset.dialog] || messages.help));
    }),
  );
  const videos = [
    ["KmtzQCSh6xk", "Numa Numa", "NewNuma", "01:38"],
    ["jNQXAC9IVRw", "Me at the zoo", "jawed", "00:19"],
    ["EwTZ2xpQwpA", "Chocolate Rain", "TayZonday", "04:52"],
    ["dMH0bHeiRNg", "Evolution of Dance", "judsonlaipply", "06:00"],
  ];
  function related(which = "related") {
    const names = {
      related: "related",
      user: "morefromuser",
      playlists: "playlist",
    };
    document.querySelector(".related-tabs").style.backgroundImage =
      "url(" + asset("btn_exploretab_" + names[which] + "_300x34.gif") + ")";
    document
      .querySelectorAll("[data-related]")
      .forEach((b) =>
        b.setAttribute("aria-selected", String(b.dataset.related === which)),
      );
    $("relatedList").replaceChildren();
    if (which === "playlists") {
      $("relatedCount").textContent = "Your favorites";
      $("relatedList").append(
        el(
          "p",
          "smallText",
          data.favorite
            ? "This video is in your Favorites."
            : "No playlists yet. Try “Save to Favorites.”",
        ),
      );
      return;
    }
    const list =
      which === "user"
        ? isNuma()
          ? videos.slice(0, 1)
          : [
              [
                videoId,
                $("vi-title-left").textContent,
                $("vi-channel").textContent,
                "",
              ],
            ]
        : videos;
    $("relatedCount").textContent =
      "Showing 1–" + list.length + " of " + list.length;
    for (const [id, title, author, time] of list) {
      const item = el("div", "related-item"),
        thumb = el("a"),
        link = el("a", "related-title", title);
      thumb.href = link.href = "https://www.youtube.com/watch?v=" + id;
      const img = el("img", "related-thumb");
      img.src =
        id === "KmtzQCSh6xk"
          ? "video/numanuma.jpg"
          : "https://i.ytimg.com/vi/" + id + "/default.jpg";
      img.alt = title;
      img.loading = "lazy";
      thumb.append(img);
      const meta = el("div", "related-meta");
      meta.append(link, el("div", "", time), el("div", "", "From: " + author));
      const stars = el("span", "related-stars");
      for (let n = 0; n < 5; n++) {
        const star = el("img");
        star.src = asset("icn_star_full_19x20.png");
        star.width = 12;
        star.height = 12;
        star.alt = "";
        stars.append(star);
      }
      meta.append(stars);
      for (const a of [thumb, link])
        a.addEventListener("click", (e) => {
          e.preventDefault();
          if (id === "KmtzQCSh6xk") {
            location.href = "watch.html";
            return;
          }
          $("ytUrlInput").value = a.href;
          $("ytLoaderForm").requestSubmit();
          window.scrollTo(0, 0);
        });
      item.append(thumb, meta);
      $("relatedList").append(item);
    }
  }
  document
    .querySelectorAll("[data-related]")
    .forEach((b) =>
      b.addEventListener("click", () => related(b.dataset.related)),
    );
  $("seeAllVideos").addEventListener("click", (e) => {
    e.preventDefault();
    related();
  });
  window.addEventListener("watch-video-change", (event) => {
    loadVideo(event.detail.id);
    related();
  });
  loadVideo(videoId);
  related();
})();
