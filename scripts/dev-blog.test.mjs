import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, preview } from "vite";
import {
  createBlogStore,
  blogEditorPlugin,
  saveBlogImage,
  blogDrafts,
} from "./dev-blog-server.mjs";

async function fixture(fn) {
  const root = await mkdtemp(join(tmpdir(), "blog-author-test-"));
  const { mkdir } = await import("node:fs/promises");
  await mkdir(join(root, "src"));
  const file = join(root, "src/blogData.json");
  await writeFile(file, JSON.stringify({ categories: ["Notes"], posts: [] }));
  try {
    await fn({ root, file, store: createBlogStore(file) });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
const article = {
  action: "save",
  title: "Hello, world!",
  date: "2026-09-15",
  category: "Notes",
  body: 'First line\nSecond line\n\nLiteral <script>alert("hi")</script> & quotes.',
};
test("saved text survives disk reload, edits preserve IDs, duplicate titles get unique paths", () =>
  fixture(async ({ store, file }) => {
    const initial = await store.read();
    const saved = await store.change({
      ...article,
      revision: initial.revision,
    });
    assert.equal(saved.post.slug, "hello-world");
    assert.match(
      saved.post.recordKey,
      /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/,
    );
    assert.deepEqual(
      JSON.parse(await readFile(file, "utf8")).posts[0].body[0].paragraphs,
      [
        "First line\nSecond line",
        'Literal <script>alert("hi")</script> & quotes.',
      ],
    );
    const edited = await store.change({
      ...article,
      slug: saved.post.slug,
      title: "Changed title",
      date: "2026-09-16",
      revision: saved.revision,
    });
    assert.equal(edited.post.slug, saved.post.slug);
    assert.equal(edited.post.recordKey, saved.post.recordKey);
    assert.equal(edited.post.publishedAt, "2026-09-16T12:00:00.000Z");
    const duplicate = await store.change({
      ...article,
      revision: edited.revision,
    });
    assert.equal(duplicate.post.slug, "hello-world-2");
    assert.notEqual(duplicate.post.recordKey, saved.post.recordKey);
  }));
test("new folders persist without articles; moving an article preserves its content and identity", () =>
  fixture(async ({ store }) => {
    const empty = await store.read();
    const folder = await store.change({
      action: "category",
      category: "Projects",
      revision: empty.revision,
    });
    assert.deepEqual((await store.read()).categories, ["Notes", "Projects"]);
    const saved = await store.change({ ...article, revision: folder.revision });
    const moved = await store.change({
      action: "move",
      slug: saved.post.slug,
      category: "Projects",
      revision: saved.revision,
    });
    assert.equal(moved.post.category, "Projects");
    assert.deepEqual(moved.post.body, saved.post.body);
    assert.equal(moved.post.recordKey, saved.post.recordKey);
  }));
test("stale or concurrent writers cannot silently replace another save", () =>
  fixture(async ({ store }) => {
    const initial = await store.read();
    const result = await Promise.allSettled([
      store.change({ ...article, revision: initial.revision }),
      store.change({
        ...article,
        title: "Concurrent",
        revision: initial.revision,
      }),
    ]);
    assert.equal(result.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
      result.find((r) => r.status === "rejected").reason.status,
      409,
    );
    const current = await store.read();
    assert.equal(current.posts.length, 1);
    await assert.rejects(
      store.change({
        ...article,
        date: "2026-02-30",
        revision: current.revision,
      }),
      /valid publication date/,
    );
    await assert.rejects(
      store.change({
        ...article,
        category: "All articles",
        revision: current.revision,
      }),
      /built-in folder/,
    );
    assert.equal((await store.read()).revision, current.revision);
  }));
test("real dev HTTP endpoint writes only same-origin local requests; preview has no write endpoint", () =>
  fixture(async ({ root, file }) => {
    const server = await createServer({
      root,
      configFile: false,
      plugins: [blogEditorPlugin()],
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    try {
      const current = await (await fetch(origin + "/__dev/blog")).json();
      const request = {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify({ ...article, revision: current.revision }),
      };
      const cross = await fetch(origin + "/__dev/blog", {
        ...request,
        headers: { ...request.headers, Origin: "https://unrelated.example" },
      });
      assert.equal(cross.status, 403);
      const success = await fetch(origin + "/__dev/blog", request);
      assert.equal(success.status, 200);
      assert.equal(
        JSON.parse(await readFile(file, "utf8")).posts[0].title,
        article.title,
      );
      const noOrigin = await fetch(origin + "/__dev/blog", {
        ...request,
        headers: { "Content-Type": "application/json" },
      });
      assert.equal(noOrigin.status, 403);
    } finally {
      await server.close();
    }
    const prod = await preview({
      root,
      configFile: false,
      plugins: [blogEditorPlugin()],
      preview: { host: "127.0.0.1", port: 0 },
    });
    try {
      const response = await fetch(
        `http://127.0.0.1:${prod.httpServer.address().port}/__dev/blog`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );
      assert.notEqual(response.status, 200);
    } finally {
      await new Promise((resolve) => prod.httpServer.close(resolve));
    }
  }));

test("rich formatting is saved as safe text blocks and survives edits", () =>
  fixture(async ({ store }) => {
    const initial = await store.read();
    const html =
      "<h2>A heading</h2><p><b>Bold</b> and <i>italic</i><br>next line</p><ul><li>First</li><li><u>Second</u></li></ul><ol><li>Numbered</li></ol><script>bad()</script><img src=x onerror=bad()>";
    const saved = await store.change({
      ...article,
      bodyHtml: html,
      revision: initial.revision,
    });
    assert.equal(saved.post.body[0].heading, "A heading");
    assert.equal(saved.post.body[1].richText[0][0].bold, true);
    assert.equal(saved.post.body[2].list[1][0].underline, true);
    assert.equal(saved.post.body[3].ordered, true);
    assert.ok(!JSON.stringify(saved.post).includes("bad()"));
    const { bodyHtml, postText } = await import("../src/blogFormatting.js");
    assert.match(bodyHtml(saved.post.body), /<ul><li>First<\/li>/);
    assert.match(postText(saved.post), /next line/);
    assert.match(postText(saved.post), /Numbered/);
  }));
test("deletion queues permanent identities and empty categories can be deleted", () =>
  fixture(async ({ store }) => {
    const initial = await store.read();
    const saved = await store.change({
      ...article,
      revision: initial.revision,
    });
    await assert.rejects(
      store.change({
        action: "delete-category",
        category: "Notes",
        revision: saved.revision,
      }),
      /Move the articles/,
    );
    const removed = await store.change({
      action: "delete",
      slug: saved.post.slug,
      revision: saved.revision,
    });
    assert.equal(removed.posts.length, 0);
    assert.deepEqual(removed.deletedPosts, [
      { slug: saved.post.slug, recordKey: saved.post.recordKey },
    ]);
    const folder = await store.change({
      action: "delete-category",
      category: "Notes",
      revision: removed.revision,
    });
    assert.deepEqual(folder.categories, []);
  }));
test("deployment deletion is repeatable and cannot remove another article", async () => {
  const { deleteBlogRecords } = await import("./delete-blog-records.mjs");
  const post = { slug: "test", recordKey: "3mvkl76ao2222" };
  let existing = {
    cid: "test-cid",
    value: {
      site: "at://did:plc:test/site.standard.publication/3mvkl76ao2222",
      path: "/blog/test/",
    },
  };
  const site = existing.value.site;
  let deletes = 0;
  const request = async (method, body) => {
    if (method.endsWith("getRecord")) return existing;
    assert.equal(body.swapRecord, "test-cid");
    deletes++;
    existing = null;
  };
  await deleteBlogRecords([post], [], site, "did:plc:test", request);
  await deleteBlogRecords([post], [], site, "did:plc:test", request);
  assert.equal(deletes, 1);
  existing = {
    cid: "test-cid",
    value: { site: "https://someone-else.example", path: "/blog/test/" },
  };
  await assert.rejects(
    deleteBlogRecords([post], [], site, "did:plc:test", request),
    /another article/,
  );
  assert.equal(deletes, 1);
});

test("image upload stays in project and survives article and draft round trips", async () => {
  await fixture(async ({ root, store }) => {
    const png =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
    const image = await saveBlogImage(root, png);
    assert.match(image.src, /^\/assets\/blog\/uploads\/[a-f0-9]{64}\.png$/);
    assert.ok((await readFile(join(root, "public", image.src))).length);
    assert.deepEqual(await saveBlogImage(root, png), image);
    await assert.rejects(
      saveBlogImage(root, "data:image/png;base64,PHNjcmlwdD4="),
    );
    const { bodyHtml } = await import("../src/blogFormatting.js");
    const content = `<p>Before</p><img src="${image.src}" alt="Test picture"><p>After</p>`;
    const data = await store.change({
      ...article,
      bodyHtml: content,
      revision: (await store.read()).revision,
    });
    assert.equal(data.post.body[1].image.src, image.src);
    assert.match(bodyHtml(data.post.body), /alt="Test picture"/);
    const { draft } = await blogDrafts(root, {
      action: "draft-save",
      title: "Unfinished",
      bodyHtml: content,
    });
    assert.equal(
      (await blogDrafts(root, { action: "draft-list" })).drafts[0].bodyHtml,
      bodyHtml(data.post.body),
    );
    assert.equal((await store.read()).posts.length, 1);
    await blogDrafts(root, { action: "draft-delete", id: draft.id });
    assert.equal(
      (await blogDrafts(root, { action: "draft-list" })).drafts.length,
      0,
    );
    await assert.rejects(
      blogDrafts(root, { action: "draft-save", id: "../escape" }),
    );
  });
});
