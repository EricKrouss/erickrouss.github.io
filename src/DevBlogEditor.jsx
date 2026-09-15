import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Art.jsx";
import { bodyHtml } from "./blogFormatting.js";
import { readBlog, writeBlog } from "./devBlogApi.js";
import "./dev-blog.css";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export function DevBlogContextMenu({ request, onClose, onChoose }) {
  const menu = useRef(null);
  useEffect(() => {
    menu.current?.querySelector("button")?.focus();
    const dismiss = (event) => {
      if (!menu.current?.contains(event.target)) onClose();
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return createPortal(
    <div
      className="dev-blog-context"
      role="menu"
      aria-label="Blog editing"
      ref={menu}
      style={{
        left: Math.max(4, Math.min(request.x, innerWidth - 220)),
        top: Math.max(4, Math.min(request.y, innerHeight - 100)),
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
        if (["ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          const buttons = [...menu.current.querySelectorAll("button")];
          buttons[
            (buttons.indexOf(document.activeElement) +
              (event.key === "ArrowDown" ? 1 : -1) +
              buttons.length) %
              buttons.length
          ].focus();
        }
      }}
    >
      {request.slug && (
        <button
          role="menuitem"
          onClick={() => onChoose({ mode: "edit", slug: request.slug })}
        >
          Edit article…
        </button>
      )}
      <button
        role="menuitem"
        onClick={() =>
          onChoose({
            mode: request.slug ? "delete" : "delete-category",
            slug: request.slug,
            category: request.category,
          })
        }
      >
        <Icon name="trash" />
        {request.slug ? "Delete article…" : "Delete category…"}
      </button>
    </div>,
    document.body,
  );
}
export default function DevBlogEditor({ request, onClose, onSaved, onOpen }) {
  const [closePrompt, setClosePrompt] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const imageInput = useRef(null);
  const [imageAlt, setImageAlt] = useState("");
  const [draftId, setDraftId] = useState(request.draft?.id);
  const categoryOnly = ["category", "delete-category"].includes(request.mode);
  const deleting = request.mode.startsWith("delete");
  const [fields, setFields] = useState({
    title: "",
    date: today(),
    category: request.category || "Site notes",
    bodyHtml: "",
  });
  const [baseline, setBaseline] = useState(null);
  const [revision, setRevision] = useState("");
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const dialog = useRef(null);
  const editor = useRef(null);
  const selection = useRef(null);
  const [formatting, setFormatting] = useState({});
  const dirty =
    !deleting && baseline !== null && JSON.stringify(fields) !== baseline;
  useEffect(() => {
    dialog.current.showModal();
    let cancelled = false;
    if (request.mode === "drafts") {
      writeBlog({ action: "draft-list" })
        .then((data) => setDrafts(data.drafts))
        .catch((cause) => setError(cause.message))
        .finally(() => setBusy(false));
      return;
    }
    readBlog()
      .then((data) => {
        if (cancelled) return;
        const post = data.posts.find((item) => item.slug === request.slug);
        if (request.slug && !post)
          throw new Error("This article no longer exists.");
        const initial = request.draft
          ? {
              title: request.draft.title,
              date: request.draft.date,
              category: request.draft.category,
              bodyHtml: request.draft.bodyHtml,
            }
          : post
            ? {
                title: post.title,
                date: post.date,
                category: post.category,
                bodyHtml: bodyHtml(post.body),
              }
            : {
                title: "",
                date: today(),
                category: categoryOnly
                  ? request.category || ""
                  : request.category || data.categories[0] || "Site notes",
                bodyHtml: "",
              };
        setFields(initial);
        setBaseline(JSON.stringify(initial));
        setCategories(data.categories);
        setRevision(data.revision);
        if (editor.current) editor.current.innerHTML = initial.bodyHtml;
      })
      .catch((cause) => {
        if (!cancelled) setError(cause.message);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const warn = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function close() {
    if (busy) return;
    if (dirty && !categoryOnly) setClosePrompt(true);
    else onClose();
  }
  async function saveDraft() {
    setBusy(true);
    setError("");
    try {
      const data = await writeBlog({
        action: "draft-save",
        id: draftId,
        slug: request.slug,
        ...fields,
      });
      setDraftId(data.draft.id);
      onClose();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }
  async function insertImage(file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Images must be smaller than 8 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read image."));
        reader.readAsDataURL(file);
      });
      const { src } = await writeBlog({ action: "image", dataUrl });
      const img = document.createElement("img");
      img.src = src;
      img.alt = imageAlt;
      editor.current.contentEditable = "true";
      format("insertHTML", `<p>${img.outerHTML}</p><p><br></p>`);
      setImageAlt("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
      if (imageInput.current) imageInput.current.value = "";
    }
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setConflict(false);
    try {
      const data = await writeBlog({
        action: deleting ? request.mode : categoryOnly ? "category" : "save",
        slug: request.slug,
        ...fields,
        revision,
      });
      if (draftId) await writeBlog({ action: "draft-delete", id: draftId });
      onSaved(data);
    } catch (cause) {
      setError(cause.message);
      setConflict(cause.status === 409);
    } finally {
      setBusy(false);
    }
  }
  async function reloadRevision() {
    try {
      const data = await readBlog();
      setRevision(data.revision);
      setCategories(data.categories);
      setConflict(false);
      setError(
        "Latest file version loaded. Review your changes before saving.",
      );
    } catch (cause) {
      setError(cause.message);
    }
  }
  function rememberSelection() {
    const current = window.getSelection();
    if (current.rangeCount && editor.current?.contains(current.anchorNode)) {
      selection.current = current.getRangeAt(0).cloneRange();
      setFormatting(
        Object.fromEntries(
          [
            "bold",
            "italic",
            "underline",
            "insertUnorderedList",
            "insertOrderedList",
          ]
            .map((command) => [command, document.queryCommandState(command)])
            .concat([
              [
                "block",
                document.queryCommandValue("formatBlock").toLowerCase(),
              ],
            ]),
        ),
      );
    }
  }
  function changed() {
    setFields((old) => ({ ...old, bodyHtml: editor.current.innerHTML }));
    rememberSelection();
  }
  function format(command, value) {
    editor.current.focus();
    if (selection.current) {
      const current = window.getSelection();
      current.removeAllRanges();
      current.addRange(selection.current);
    }
    document.execCommand("styleWithCSS", false, false);
    document.execCommand(command, false, value);
    changed();
  }
  const update = (key) => (event) =>
    setFields((old) => ({ ...old, [key]: event.target.value }));
  return createPortal(
    <dialog
      className="dev-blog-dialog active"
      ref={dialog}
      aria-labelledby="compose-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="title-bar">
        <Icon name={deleting ? "trash" : categoryOnly ? "folder" : "outlook"} />
        <h2 id="compose-title">
          {request.mode === "drafts"
            ? "Drafts"
            : deleting
              ? categoryOnly
                ? "Delete category"
                : "Delete article"
              : categoryOnly
                ? "New category"
                : request.slug
                  ? "Edit article"
                  : "Compose new mail"}{" "}
          — Blog Express
        </h2>
        <button
          type="button"
          className="window-control close"
          aria-label="Close composer"
          disabled={busy}
          onClick={close}
        />
      </div>
      {request.mode === "drafts" ? (
        <div className="dev-draft-list">
          {!drafts.length && (
            <p>{busy ? "Loading drafts…" : "No saved drafts."}</p>
          )}
          {drafts
            .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
            .map((draft) => (
              <div key={draft.id}>
                <button
                  onClick={() =>
                    onOpen({ mode: "edit", slug: draft.slug, draft })
                  }
                >
                  <Icon name="note" /> {draft.title || "Untitled draft"}
                </button>
                <button
                  aria-label={`Delete draft ${draft.title || "Untitled"}`}
                  onClick={async () => {
                    try {
                      await writeBlog({ action: "draft-delete", id: draft.id });
                      setDrafts((old) =>
                        old.filter((item) => item.id !== draft.id),
                      );
                    } catch (cause) {
                      setError(cause.message);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          {error && <p role="alert">{error}</p>}
        </div>
      ) : (
        <form onSubmit={save}>
          {closePrompt && (
            <div
              className="dev-draft-prompt"
              role="alertdialog"
              aria-label="Save unfinished article"
            >
              <p>Save this unfinished article as a draft before closing?</p>
              <button type="button" disabled={busy} onClick={saveDraft}>
                Save draft
              </button>{" "}
              <button type="button" disabled={busy} onClick={onClose}>
                Discard
              </button>{" "}
              <button
                type="button"
                disabled={busy}
                onClick={() => setClosePrompt(false)}
              >
                Keep editing
              </button>
            </div>
          )}
          <div className="dev-compose-toolbar">
            <button
              type="submit"
              className={!deleting && !categoryOnly ? "dev-compose-send" : undefined}
              title={!deleting && !categoryOnly ? "Save article to project" : undefined}
              disabled={busy || !revision || conflict}
            >
              {!deleting && !categoryOnly ? (
                <i className="dev-compose-send-icon" aria-hidden="true" />
              ) : (
                <Icon name={deleting ? "trash" : "folder"} size={24} />
              )}
              {busy
                ? "Please wait…"
                : deleting
                  ? categoryOnly
                    ? "Delete category"
                    : "Delete article"
                  : categoryOnly
                    ? "Create folder"
                    : "Send"}
            </button>
            <button type="button" disabled={busy} onClick={close}>
              Cancel
            </button>
            {!categoryOnly && !deleting && (
              <button
                type="button"
                disabled={busy || !revision}
                onClick={saveDraft}
              >
                Save draft
              </button>
            )}
            <span>Local development</span>
          </div>
          {deleting ? (
            <div className="dev-delete-message">
              <p>
                Delete{" "}
                <strong>{categoryOnly ? fields.category : fields.title}</strong>
                ?
              </p>
              <p>
                {categoryOnly
                  ? "Only empty category folders can be deleted."
                  : "This removes the article from the project. Its Standard.site record will be removed on your next deployment."}
              </p>
            </div>
          ) : (
            <fieldset disabled={busy || !revision}>
              {!categoryOnly && (
                <>
                  <label>
                    Title
                    <input
                      autoFocus
                      required
                      maxLength={500}
                      value={fields.title}
                      onChange={update("title")}
                    />
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      required
                      value={fields.date}
                      onChange={update("date")}
                    />
                  </label>
                </>
              )}
              <label>
                Category
                <input
                  autoFocus={categoryOnly}
                  list={categoryOnly ? undefined : "dev-blog-categories"}
                  required
                  maxLength={100}
                  placeholder="Choose or type a new category"
                  value={fields.category}
                  onChange={update("category")}
                />
              </label>
              <datalist id="dev-blog-categories">
                {categories.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {!categoryOnly && (
                <div className="dev-compose-body">
                  <div
                    className="dev-format-toolbar"
                    role="toolbar"
                    aria-label="Text formatting"
                  >
                    <select
                      aria-label="Paragraph style"
                      value={
                        ["h2", "h3"].includes(formatting.block)
                          ? formatting.block
                          : "p"
                      }
                      onChange={(event) =>
                        format("formatBlock", event.target.value)
                      }
                    >
                      <option value="p">Normal text</option>
                      <option value="h2">Heading 1</option>
                      <option value="h3">Heading 2</option>
                    </select>
                    {[
                      ["bold", "B", "Bold"],
                      ["italic", "I", "Italic"],
                      ["underline", "U", "Underline"],
                      ["insertUnorderedList", "• ≡", "Bullet points"],
                      ["insertOrderedList", "1. ≡", "Numbered list"],
                    ].map(([command, label, title]) => (
                      <button
                        type="button"
                        key={command}
                        title={title}
                        aria-label={title}
                        aria-pressed={!!formatting[command]}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => format(command)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="dev-image-toolbar">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => imageInput.current.click()}
                    >
                      Insert image…
                    </button>
                    <input
                      aria-label="Image description"
                      placeholder="Image description (alt text)"
                      value={imageAlt}
                      onChange={(event) => setImageAlt(event.target.value)}
                    />
                    <input
                      hidden
                      ref={imageInput}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(event) => insertImage(event.target.files[0])}
                    />
                  </div>
                  <div
                    ref={editor}
                    className="dev-rich-editor"
                    contentEditable={!busy && !!revision}
                    suppressContentEditableWarning
                    role="textbox"
                    aria-label="Article text"
                    aria-multiline="true"
                    aria-required="true"
                    spellCheck
                    onInput={changed}
                    onMouseUp={rememberSelection}
                    onKeyUp={rememberSelection}
                    onPaste={(event) => {
                      event.preventDefault();
                      document.execCommand(
                        "insertText",
                        false,
                        event.clipboardData.getData("text/plain"),
                      );
                      changed();
                    }}
                  />
                </div>
              )}
            </fieldset>
          )}
          {error && (
            <div className="dev-compose-error" role="alert">
              {error}
              {conflict && (
                <button type="button" onClick={reloadRevision}>
                  Keep my changes and use latest file version
                </button>
              )}
            </div>
          )}
          <footer>
            {deleting
              ? "Changes take effect publicly on the next deployment."
              : "Saved articles join the blog on your next site deployment."}
          </footer>
        </form>
      )}
    </dialog>,
    document.body,
  );
}
