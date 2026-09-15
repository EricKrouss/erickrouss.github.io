import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Icon } from "./Art.jsx";
import { blogPosts as initialPosts, blogCategories } from "./blogPosts.js";
import BlogArticleBody from "./BlogArticleBody.jsx";
import { postText } from "./blogFormatting.js";
import publishedRecords from "../standard-site-records.json";

const storageKey = "eric-blog-reader-v1";
const DevBlogEditor = import.meta.env.DEV
  ? lazy(() => import("./DevBlogEditor.jsx"))
  : null;
const DevBlogContextMenu = import.meta.env.DEV
  ? lazy(() =>
      import("./DevBlogEditor.jsx").then((module) => ({
        default: module.DevBlogContextMenu,
      })),
    )
  : null;
const linkedPost = (posts = initialPosts) =>
  posts.find(
    (post) =>
      location.hash === `#blog/${post.slug}` ||
      (!location.hash.startsWith("#blog/") &&
        location.pathname === `/blog/${post.slug}/`),
  );
const formatDate = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
function loadReader() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    return {
      read: Array.isArray(value?.read)
        ? value.read.filter((id) =>
            initialPosts.some((post) => post.slug === id),
          )
        : [],
      saved: Array.isArray(value?.saved)
        ? value.saved.filter((id) =>
            initialPosts.some((post) => post.slug === id),
          )
        : [],
    };
  } catch {
    return { read: [], saved: [] };
  }
}

export default function BlogExpress({ visible, showNotice }) {
  const [devData, setDevData] = useState(null);
  const blogPosts =
    import.meta.env.DEV && devData ? devData.posts : initialPosts;
  const categories =
    import.meta.env.DEV && devData ? devData.categories : blogCategories;
  const [contextMenu, setContextMenu] = useState(null);
  const [composer, setComposer] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.hot) {
      const update = (data) => setDevData(data);
      import.meta.hot.on("blog:data", update);
      return () => import.meta.hot.off("blog:data", update);
    }
  }, []);
  function savedToProject(data) {
    setDevData(data);
    setComposer(null);
    if (data.post) {
      setSelected(data.post.slug);
      setFolder(data.post.category);
      setQuery("");
    }
    if (data.deletedSlug === selected) setSelected(data.posts[0]?.slug);
    if (data.action?.startsWith("delete")) {
      setFolder("All articles");
      setMessage("Deleted from project. Ready for your next deployment.");
    } else setMessage("Saved to project. Ready for your next deployment.");
  }
  async function moveToCategory(slug, category) {
    setDropTarget(null);
    if (!slug) return;
    try {
      const { moveArticle } = await import("./devBlogApi.js");
      const data = await moveArticle(slug, category);
      setDevData(data);
      setFolder(category);
      setSelected(slug);
      setMessage(`Moved article to ${category} and saved to project.`);
    } catch (error) {
      setMessage(error.message);
    }
  }
  const [reader, setReader] = useState(loadReader);
  const [folder, setFolder] = useState("All articles");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(
    () => linkedPost()?.slug || blogPosts[0]?.slug,
  );
  const [sort, setSort] = useState({ key: "date", ascending: false });
  const [menu, setMenu] = useState(null);
  const [message, setMessage] = useState("");
  const root = useRef(null);
  const search = useRef(null);
  const readingPane = useRef(null);
  const post = blogPosts.find((item) => item.slug === selected);
  const saved = reader.saved.includes(selected);
  const matchesFolder = (item, name) =>
    name === "All articles" ||
    (name === "Unread articles"
      ? !reader.read.includes(item.slug)
      : name === "Saved articles"
        ? reader.saved.includes(item.slug)
        : item.category === name);
  const filtered = blogPosts
    .filter(
      (item) =>
        matchesFolder(item, folder) &&
        [item.title, item.category, item.excerpt, postText(item)]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        (sort.ascending ? 1 : -1) * a[sort.key].localeCompare(b[sort.key]),
    );
  const position = filtered.findIndex((item) => item.slug === selected);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reader));
    } catch {
      setMessage("Reading preferences will only last for this visit.");
    }
  }, [reader]);
  useEffect(() => {
    if (visible && selected)
      setReader((old) =>
        old.read.includes(selected)
          ? old
          : { ...old, read: [...old.read, selected] },
      );
  }, [visible, selected]);
  useEffect(() => {
    const followLink = () => {
      const next = linkedPost(blogPosts);
      if (next) {
        setSelected(next.slug);
        setFolder("All articles");
        setQuery("");
      }
    };
    window.addEventListener("hashchange", followLink);
    window.addEventListener("popstate", followLink);
    return () => {
      window.removeEventListener("hashchange", followLink);
      window.removeEventListener("popstate", followLink);
    };
  }, [blogPosts]);
  useEffect(() => {
    readingPane.current?.scrollTo(0, 0);
  }, [selected]);
  useEffect(() => {
    if (!visible || !post) return;
    document.title = `${post.title} — Blog Express`;
    const updateLink = (rel, href) => {
      let link = document.head.querySelector(`link[rel="${rel}"]`);
      if (!href) {
        link?.remove();
        return;
      }
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.append(link);
      }
      link.href = href;
    };
    updateLink("canonical", `https://erickrouss.github.io/blog/${post.slug}/`);
    updateLink(
      "site.standard.document",
      publishedRecords.documents[`blog-${post.slug}`],
    );
  }, [visible, post]);
  useEffect(() => {
    const dismiss = (event) => {
      if (!root.current?.querySelector(".blog-menubar")?.contains(event.target))
        setMenu(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  const suppressArticleClick = useRef(false);
  function openArticle(item) {
    if (suppressArticleClick.current) return;
    setSelected(item.slug);
    setReader((old) =>
      old.read.includes(item.slug)
        ? old
        : { ...old, read: [...old.read, item.slug] },
    );
    history.pushState(null, "", `/blog/${item.slug}/`);
    setMessage("");
  }
  function chooseFolder(name) {
    setFolder(name);
    setQuery("");
    setMenu(null);
  }
  function toggleSaved() {
    if (!post) return;
    setReader((old) => ({
      ...old,
      saved: old.saved.includes(selected)
        ? old.saved.filter((id) => id !== selected)
        : [...old.saved, selected],
    }));
    setMessage(
      saved
        ? "Article removed from Saved articles."
        : "Article saved in this browser.",
    );
  }
  async function copyLink() {
    if (!post) return;
    const url = new URL(location.href);
    url.pathname = `/blog/${post.slug}/`;
    url.hash = "";
    url.search = "";
    try {
      await navigator.clipboard.writeText(url.href);
      setMessage("Article link copied.");
    } catch {
      showNotice(`Copy this article link:\n\n${url.href}`);
    }
  }
  function sortBy(key) {
    setSort((old) => ({
      key,
      ascending: old.key === key ? !old.ascending : key !== "date",
    }));
  }
  const menuItems = {
    Articles: [
      ...(import.meta.env.DEV
        ? [
            [
              "Compose new mail…",
              () =>
                setComposer({
                  mode: "new",
                  category: categories.includes(folder)
                    ? folder
                    : categories[0],
                }),
            ],
            [
              "Edit article…",
              () => setComposer({ mode: "edit", slug: selected }),
              !post,
            ],
            ["New category…", () => setComposer({ mode: "category" })],
          ]
        : []),
      ["All articles", () => chooseFolder("All articles")],
      [saved ? "Unsave article" : "Save article", toggleSaved, !post],
      ["Copy article link", copyLink, !post],
      [
        "Mark all as read",
        () =>
          setReader((old) => ({
            ...old,
            read: blogPosts.map((item) => item.slug),
          })),
      ],
    ],
    View: [
      ["Unread articles", () => chooseFolder("Unread articles")],
      ["Saved articles", () => chooseFolder("Saved articles")],
      ["Newest first", () => setSort({ key: "date", ascending: false })],
      ["Oldest first", () => setSort({ key: "date", ascending: true })],
    ],
    Help: [
      [
        "About Blog Express",
        () =>
          showNotice(
            "Blog Express\n\nA personal blog reader inspired by Outlook Express. Pick an article to read it, browse categories, or search its text. Saved articles and reading history stay in this browser.",
          ),
      ],
    ],
  };
  return (
    <div
      className="blog-express"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMenu(null);
          root.current?.querySelector(`[data-blog-menu="${menu}"]`)?.focus();
        }
      }}
    >
      {import.meta.env.DEV && composer && (
        <Suspense fallback={<span role="status">Opening composer…</span>}>
          <DevBlogEditor
            request={composer}
            onClose={() => setComposer(null)}
            onSaved={savedToProject}
          />
        </Suspense>
      )}
      {import.meta.env.DEV && contextMenu && (
        <Suspense fallback={null}>
          <DevBlogContextMenu
            request={contextMenu}
            onClose={() => setContextMenu(null)}
            onChoose={(request) => {
              setContextMenu(null);
              setComposer(request);
            }}
          />
        </Suspense>
      )}
      <div className="blog-menubar" aria-label="Blog menus">
        {Object.entries(menuItems).map(([name, items]) => (
          <div className="blog-menu" key={name}>
            <button
              data-blog-menu={name}
              aria-expanded={menu === name}
              onClick={() => setMenu(menu === name ? null : name)}
            >
              {name}
            </button>
            {menu === name && (
              <div className="blog-dropdown">
                {items.map(([label, action, disabled]) => (
                  <button
                    key={label}
                    disabled={disabled}
                    onClick={() => {
                      setMenu(null);
                      action();
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <span className="blog-menubar-note">Eric’s personal blog</span>
      </div>
      <div className="blog-toolbar" aria-label="Article actions">
        <button onClick={() => chooseFolder("All articles")}>
          <Icon name="outlook" size={32} />
          <span>All articles</span>
        </button>
        <span className="blog-toolbar-divider" />
        <button
          disabled={position <= 0}
          onClick={() => openArticle(filtered[position - 1])}
        >
          <span className="blog-arrow">◀</span>
          <span>Previous</span>
        </button>
        <button
          disabled={!filtered.length || position >= filtered.length - 1}
          onClick={() => openArticle(filtered[position + 1])}
        >
          <span className="blog-arrow">▶</span>
          <span>Next</span>
        </button>
        <span className="blog-toolbar-divider" />
        <button disabled={!post} aria-pressed={saved} onClick={toggleSaved}>
          <Icon name="favorites" size={32} />
          <span>{saved ? "Unsave article" : "Save article"}</span>
        </button>
        <button disabled={!post} onClick={copyLink}>
          <Icon name="network" size={32} />
          <span>Copy link</span>
        </button>
        <button onClick={() => search.current?.focus()}>
          <Icon name="search" size={32} />
          <span>Find</span>
        </button>
        <div className="blog-wordmark" aria-hidden="true">
          <Icon name="outlook" size={32} />
          <span>
            Blog
            <br />
            <b>Express</b>
          </span>
        </div>
      </div>
      <form
        className="blog-search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="blog-search">Look for:</label>
        <input
          id="blog-search"
          ref={search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles…"
        />
        <span>in {folder}</span>
        {query && (
          <button onClick={() => setQuery("")} type="button">
            Clear
          </button>
        )}
      </form>
      <div className="blog-workspace">
        <aside className="blog-sidebar">
          <div className="blog-pane-caption">Folders
            {import.meta.env.DEV && <button className="blog-new-folder" onClick={() => setComposer({ mode: "category" })} title="Create a new category folder"><Icon name="folder" /> New folder…</button>}
          </div>
          <div className="blog-folder-root">
            <Icon name="computer" /> Blog Express
          </div>
          <nav aria-label="Article folders">
            {[
              "All articles",
              "Unread articles",
              "Saved articles",
              ...categories,
            ].map((name, index) => (
              <button
                key={name}
                className={`${folder === name ? "selected" : ""} ${index > 2 ? "blog-category" : ""}`}
                onContextMenu={
                  import.meta.env.DEV && index > 2
                    ? (event) => {
                        event.preventDefault();
                        setContextMenu({
                          x: event.clientX,
                          y: event.clientY,
                          category: name,
                        });
                      }
                    : undefined
                }
                data-drop-target={dropTarget === name || undefined}
                data-blog-category={
                  import.meta.env.DEV && index > 2 ? name : undefined
                }
                aria-pressed={folder === name}
                onClick={() => chooseFolder(name)}
              >
                <Icon
                  name={name === "Saved articles" ? "favorites" : "folder"}
                />
                <span>{name}</span>
                <small>
                  {blogPosts.filter((item) => matchesFolder(item, name)).length}
                </small>
              </button>
            ))}
          </nav>
          <div className="blog-sidebar-note">
            <Icon name="outlook" size={32} />
            <strong>
              A little correspondence
              <br />
              from the desktop.
            </strong>
            <p>
              Notes, projects &amp; things
              <br />
              worth writing down.
            </p>
          </div>
        </aside>
        <div className="blog-main">
          <div className="blog-folder-heading">
            <Icon name="folder" /> <strong>{folder}</strong>
            <span>
              {filtered.length} article{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          <div
            className="blog-article-list"
            tabIndex={0}
            aria-label="Scrollable article list"
          >
            <table>
              <thead>
                <tr>
                  {[
                    ["title", "Article"],
                    ["category", "Category"],
                    ["date", "Published"],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      scope="col"
                      aria-sort={
                        sort.key === key
                          ? sort.ascending
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button onClick={() => sortBy(key)}>
                        {label}
                        {sort.key === key && (
                          <span aria-hidden="true">
                            {" "}
                            {sort.ascending ? "▴" : "▾"}
                          </span>
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.slug}
                    onContextMenu={
                      import.meta.env.DEV
                        ? (event) => {
                            event.preventDefault();
                            setContextMenu({
                              x: event.clientX,
                              y: event.clientY,
                              slug: item.slug,
                            });
                          }
                        : undefined
                    }
                    onPointerDown={
                      import.meta.env.DEV
                        ? (event) => {
                            if (event.button !== 0) return;
                            const source = event.currentTarget;
                            source.setPointerCapture(event.pointerId);
                            const x = event.clientX,
                              y = event.clientY;
                            let dragging = false;
                            const targetAt = (e) =>
                              document
                                .elementFromPoint(e.clientX, e.clientY)
                                ?.closest("[data-blog-category]")?.dataset
                                .blogCategory;
                            const move = (e) => {
                              if (
                                !dragging &&
                                Math.hypot(e.clientX - x, e.clientY - y) < 6
                              )
                                return;
                              dragging = true;
                              source.setPointerCapture(event.pointerId);
                              setDropTarget(targetAt(e) || null);
                            };
                            const finish = (e) => {
                              source.removeEventListener("pointermove", move);
                              source.removeEventListener("pointerup", finish);
                              source.removeEventListener(
                                "pointercancel",
                                finish,
                              );
                              setDropTarget(null);
                              if (!dragging) return;
                              suppressArticleClick.current = true;
                              setTimeout(() => {
                                suppressArticleClick.current = false;
                              }, 0);
                              const category = targetAt(e);
                              if (e.type === "pointerup" && category)
                                moveToCategory(item.slug, category);
                            };
                            source.addEventListener("pointermove", move);
                            source.addEventListener("pointerup", finish);
                            source.addEventListener("pointercancel", finish);
                          }
                        : undefined
                    }
                    className={`${selected === item.slug ? "selected" : ""} ${reader.read.includes(item.slug) ? "" : "unread"}`}
                    onClick={() => openArticle(item)}
                  >
                    <td>
                      <button
                        draggable={false}
                        aria-current={
                          selected === item.slug ? "true" : undefined
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          openArticle(item);
                        }}
                      >
                        <Icon name="note" />
                        <span>{item.title}</span>
                        {reader.saved.includes(item.slug) && (
                          <span aria-label="Saved">★</span>
                        )}
                      </button>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <time dateTime={item.date}>{formatDate(item.date)}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="blog-empty">
                <strong>No articles in this view.</strong>
                <p>
                  {query
                    ? "Try another search, or clear it to see this folder."
                    : folder === "Saved articles"
                      ? "Use Save article to keep a post here."
                      : folder === "Unread articles"
                        ? "You’re all caught up."
                        : "Check back for new posts."}
                </p>
                <button onClick={() => chooseFolder("All articles")}>
                  Show all articles
                </button>
              </div>
            )}
          </div>
          {post ? (
            <>
              <header className="blog-article-header">
                <div>
                  <span>From:</span>
                  <strong>{post.author}</strong>
                </div>
                <div>
                  <span>Published:</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span className="blog-header-category">{post.category}</span>
                </div>
                <div>
                  <span>Subject:</span>
                  <strong>{post.title}</strong>
                </div>
              </header>
              <article
                className="blog-reading-pane"
                ref={readingPane}
                tabIndex={0}
                aria-label={`Read ${post.title}`}
              >
                <h1>{post.title}</h1>
                {post.excerpt && <p className="blog-deck">{post.excerpt}</p>}
                <BlogArticleBody body={post.body} />
                <footer>
                  Filed under {post.category} · {post.author}
                </footer>
              </article>
            </>
          ) : (
            <div className="blog-empty">
              Select an article to start reading.
            </div>
          )}
        </div>
      </div>
      <div className="blog-status" role="status">
        <span>
          {message ||
            `${filtered.length} article${filtered.length === 1 ? "" : "s"} in this view, ${blogPosts.filter((item) => !reader.read.includes(item.slug)).length} unread`}
        </span>
        <span>
          <Icon name="disk" /> Local folders
        </span>
      </div>
    </div>
  );
}
