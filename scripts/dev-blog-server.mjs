import {
  readFile,
  writeFile,
  rename,
  rm,
  mkdir,
  readdir,
} from "node:fs/promises";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { parseHTML } from "linkedom";
import { blocksFromDom, postText, bodyHtml } from "../src/blogFormatting.js";

const endpoint = "/__dev/blog";
const reserved = ["All articles", "Unread articles", "Saved articles"];
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
function text(value, label, max) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw fail(`${label} is required (maximum ${max} characters).`);
  return value.trim();
}
function category(value) {
  const name = text(value, "Category", 100);
  if (reserved.some((item) => item.toLowerCase() === name.toLowerCase()))
    throw fail("Choose a category name other than a built-in folder.");
  return name;
}
function tid() {
  let value = ((BigInt(Date.now()) * 1000n) << 10n) | BigInt(randomInt(1024));
  let result = "";
  for (let i = 0; i < 13; i++) {
    result = "234567abcdefghijklmnopqrstuvwxyz"[Number(value & 31n)] + result;
    value >>= 5n;
  }
  return result;
}
const version = (source) => createHash("sha256").update(source).digest("hex");
export async function saveBlogImage(root, dataUrl) {
  const match =
    typeof dataUrl === "string" &&
    /^data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
      dataUrl,
    );
  if (!match) throw fail("Choose a PNG, JPEG, GIF, or WebP image.");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 8 * 1024 * 1024)
    throw fail("Images must be smaller than 8 MB.");
  const type = match[1];
  const valid =
    type === "png"
      ? bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : type === "jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : type === "gif"
          ? /^GIF8[79]a$/.test(bytes.toString("ascii", 0, 6))
          : bytes.toString("ascii", 0, 4) === "RIFF" &&
            bytes.toString("ascii", 8, 12) === "WEBP";
  if (!valid) throw fail("The file is not a supported image.");
  const filename =
    createHash("sha256").update(bytes).digest("hex") +
    "." +
    (type === "jpeg" ? "jpg" : type);
  const directory = resolve(root, "public/assets/blog/uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, filename), bytes);
  return { src: `/assets/blog/uploads/${filename}` };
}
export async function blogDrafts(root, input) {
  const directory = resolve(root, ".blog-drafts");
  await mkdir(directory, { recursive: true });
  if (input.action === "draft-list") {
    const files = (await readdir(directory)).filter((name) =>
      /^[a-f0-9-]+\.json$/.test(name),
    );
    return {
      drafts: await Promise.all(
        files.map(async (name) =>
          JSON.parse(await readFile(resolve(directory, name), "utf8")),
        ),
      ),
    };
  }
  const id = input.id || randomUUID();
  if (!/^[a-f0-9-]{36}$/.test(id)) throw fail("Invalid draft ID.");
  const file = resolve(directory, `${id}.json`);
  if (input.action === "draft-delete") {
    await rm(file, { force: true });
    return { id };
  }
  const draft = {
    id,
    slug: input.slug,
    title: String(input.title || "").slice(0, 500),
    date: String(input.date || "").slice(0, 10),
    category: String(input.category || "").slice(0, 100),
    bodyHtml: String(input.bodyHtml || "").slice(0, 500000),
    savedAt: new Date().toISOString(),
  };
  // Only the allowlisted article model returns to the contenteditable surface.
  const { document } = parseHTML(`<html><body>${draft.bodyHtml}</body></html>`);
  draft.bodyHtml = bodyHtml(blocksFromDom(document.body));
  const temp = `${file}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(draft, null, 2) + "\n");
  await rename(temp, file);
  return { draft };
}
export function createBlogStore(file) {
  let queue = Promise.resolve();
  async function read() {
    const source = await readFile(file, "utf8");
    return { ...JSON.parse(source), revision: version(source) };
  }
  function change(input) {
    const operation = queue.then(async () => {
      const current = await read();
      if (input.revision !== current.revision)
        throw fail(
          "The blog changed since you opened this editor. Your text is still here; reload the latest version before saving again.",
          409,
        );
      const data = {
        categories: [...current.categories],
        posts: [...current.posts],
        deletedPosts: [...(current.deletedPosts || [])],
      };
      let post;
      const name = input.action === "delete" ? null : category(input.category);
      if (input.action === "delete") {
        const index = data.posts.findIndex((item) => item.slug === input.slug);
        if (index < 0) throw fail("Article not found.", 404);
        const removed = data.posts.splice(index, 1)[0];
        data.deletedPosts.push({
          slug: removed.slug,
          recordKey: removed.recordKey,
        });
      } else if (input.action === "delete-category") {
        if (data.posts.some((item) => item.category === name))
          throw fail(
            "Move the articles out of this folder before deleting it.",
          );
        data.categories = data.categories.filter((item) => item !== name);
      } else if (input.action === "category") {
        if (data.categories.includes(name))
          throw fail("That category already exists.");
      } else if (input.action === "move") {
        const index = data.posts.findIndex((item) => item.slug === input.slug);
        if (index < 0) throw fail("Article not found.", 404);
        if (!data.categories.includes(name))
          throw fail("Category not found.", 404);
        post = {
          ...data.posts[index],
          category: name,
          updatedAt: new Date().toISOString(),
        };
        data.posts[index] = post;
      } else if (input.action === "save") {
        const title = text(input.title, "Title", 500);
        const date = text(input.date, "Date", 10);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          !Number.isFinite(Date.parse(`${date}T12:00:00Z`)) ||
          new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date
        )
          throw fail("Enter a valid publication date.");
        let richBody;
        if (typeof input.bodyHtml === "string") {
          text(input.bodyHtml, "Article text", 500000);
          const { document } = parseHTML(
            `<html><body>${input.bodyHtml}</body></html>`,
          );
          richBody = blocksFromDom(document.body);
          if (!richBody.some((block) => block.image))
            text(postText({ body: richBody }), "Article text", 200000);
        } else text(input.body, "Article text", 200000);
        const index = input.slug
          ? data.posts.findIndex((item) => item.slug === input.slug)
          : -1;
        if (input.slug && index < 0) throw fail("Article not found.", 404);
        const existing = data.posts[index];
        let slug = existing?.slug;
        if (!slug) {
          const base =
            title
              .normalize("NFKD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 80)
              .replace(/-$/, "") || "article";
          slug = base;
          for (
            let suffix = 2;
            [...data.posts, ...data.deletedPosts].some(
              (item) => item.slug === slug,
            );
            suffix++
          )
            slug = `${base}-${suffix}`;
        }
        let recordKey = existing?.recordKey || tid();
        while (
          !existing &&
          data.posts.some((item) => item.recordKey === recordKey)
        )
          recordKey = tid();
        // An unchanged body keeps any existing structured headings intact.
        const oldBody = existing ? postText(existing) : undefined;
        const body =
          typeof input.body === "string"
            ? input.body.replace(/\r\n?/g, "\n")
            : "";
        post = {
          ...existing,
          slug,
          recordKey,
          title,
          category: name,
          date,
          author: existing?.author || "Eric Krouss",
          body:
            richBody ||
            (oldBody === body
              ? existing.body
              : [{ paragraphs: body.split(/\n{2,}/) }]),
        };
        if (existing) {
          post.updatedAt = new Date().toISOString();
          if (existing.date !== date)
            post.publishedAt = `${date}T12:00:00.000Z`;
          data.posts[index] = post;
        } else data.posts.push(post);
      } else throw fail("Unknown editor action.");
      if (
        name &&
        !input.action.startsWith("delete") &&
        !data.categories.includes(name)
      )
        data.categories.push(name);
      const source = JSON.stringify(data, null, 2) + "\n";
      const temp = `${file}.${randomUUID()}.tmp`;
      try {
        await writeFile(temp, source, { flag: "wx" });
        await rename(temp, file);
      } finally {
        await rm(temp, { force: true });
      }
      return {
        ...data,
        revision: version(source),
        post,
        action: input.action,
        deletedSlug: input.action === "delete" ? input.slug : undefined,
      };
    });
    queue = operation.catch(() => {});
    return operation;
  }
  return { read, change };
}

export function blogEditorPlugin() {
  return {
    name: "local-blog-editor",
    apply: "serve",
    async handleHotUpdate(context) {
      if (
        context.file !==
        resolve(context.server.config.root, "src/blogData.json")
      )
        return;
      try {
        const data = await createBlogStore(context.file).read();
        context.server.ws.send({ type: "custom", event: "blog:data", data });
      } catch {
        /* An external editor may still be writing; keep the last good UI. */
      }
      return [];
    },
    configureServer(server) {
      const store = createBlogStore(
        resolve(server.config.root, "src/blogData.json"),
      );
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== endpoint) return next();
        const send = (status, data) => {
          res.writeHead(status, {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          });
          res.end(JSON.stringify(data));
        };
        try {
          const host = new URL(`http://${req.headers.host}`).hostname;
          const local = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
            req.socket.remoteAddress,
          );
          if (!local || !["localhost", "127.0.0.1", "[::1]"].includes(host))
            throw fail("Open the editor on localhost on this computer.", 403);
          if (
            req.headers.origin &&
            new URL(req.headers.origin).host !== req.headers.host
          )
            throw fail("Cross-origin editor requests are not allowed.", 403);
          if (req.method === "GET") return send(200, await store.read());
          if (req.method !== "POST") throw fail("Method not allowed.", 405);
          if (
            !req.headers.origin ||
            req.headers["content-type"]?.split(";")[0] !== "application/json"
          )
            throw fail("Use the local blog composer to save articles.", 403);
          const chunks = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 12 * 1024 * 1024)
              throw fail("Article is too large.", 413);
            chunks.push(chunk);
          }
          let input;
          try {
            input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          } catch {
            throw fail("Invalid editor request.");
          }
          if (!input || typeof input !== "object")
            throw fail("Invalid editor request.");
          send(
            200,
            input.action === "image"
              ? await saveBlogImage(server.config.root, input.dataUrl)
              : ["draft-list", "draft-save", "draft-delete"].includes(
                    input.action,
                  )
                ? await blogDrafts(server.config.root, input)
                : await store.change(input),
          );
        } catch (error) {
          send(error.status || 500, {
            error: error.status
              ? error.message
              : "Could not save the blog file. Check the dev-server terminal and file permissions.",
          });
          if (!error.status) server.config.logger.error(error.message);
        }
      });
    },
  };
}
