import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { records } from "./standard-site.mjs";

const publisher = fileURLToPath(new URL("./publish-blog.mjs", import.meta.url));
const builder = fileURLToPath(new URL("./build-blog.mjs", import.meta.url));
const mock = `
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const store = existsSync('fake-pds.json') ? JSON.parse(readFileSync('fake-pds.json', 'utf8')) : { records: {}, writes: 0 };
globalThis.fetch = async (url, options) => {
  const method = url.pathname.split('/').pop();
  const body = options.body && options.headers["Content-Type"] === "application/json" ? JSON.parse(options.body) : options.body;
  const response = (data, status = 200) => new Response(JSON.stringify(data), { status });
  if (method === 'com.atproto.server.createSession') return response({ did: 'did:plc:test', accessJwt: 'test-token' });
  if (options.headers.Authorization !== 'Bearer test-token') throw Error('Missing authentication');
  if (method === 'com.atproto.repo.uploadBlob') {
    if (options.headers['Content-Type'] !== 'image/png' || body.length >= 1000000 || body[0] !== 137) throw Error('Invalid artwork upload');
    return response({ blob: { $type: 'blob', ref: { $link: 'test-png-' + body.length }, mimeType: 'image/png', size: body.length } });
  }
  if (method === 'com.atproto.repo.getRecord') {
    const key = url.searchParams.get('collection') + '/' + url.searchParams.get('rkey');
    return store.records[key] ? response(store.records[key]) : response({ error: 'RecordNotFound' }, 400);
  }
  if (method === 'com.atproto.repo.putRecord') {
    if (!/^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/.test(body.rkey)) return response({ error: 'InvalidRecord', message: 'Record key must be a TID' }, 400);
    const key = body.collection + '/' + body.rkey;
    if (body.swapRecord !== (store.records[key]?.cid ?? null)) return response({ error: 'InvalidSwap' }, 400);
    const result = { uri: 'at://did:plc:test/' + key, cid: 'test-cid-' + (++store.writes), value: body.record };
    store.records[key] = result;
    writeFileSync('fake-pds.json', JSON.stringify(store));
    return response(result);
  }
  throw Error('Unexpected network call: ' + method);
};
`;
async function sandbox(fn) {
  const dir = await mkdtemp(join(tmpdir(), "blog-standard-test-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
function run(script, cwd, args = []) {
  return spawnSync(process.execPath, [...args, script], {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      ATPROTO_IDENTIFIER: "test.invalid",
      ATPROTO_APP_PASSWORD: "test-only",
      ATPROTO_PDS: "https://test.invalid",
    },
  });
}
test("welcome exports the exact requested text at a permanent page URL", () => {
  const [document] = records();
  assert.equal(document.record.textContent, "This is where my blogs will be");
  assert.equal(document.record.path, "/blog/welcome/");
  assert.equal(document.record.$type, "site.standard.document");
});
test("publishing is idempotent and keeps verification URIs; collisions are rejected", () =>
  sandbox(async (dir) => {
    const mockPath = join(dir, "mock.mjs");
    await writeFile(mockPath, mock);
    const first = run(publisher, dir, ["--import", mockPath]);
    assert.equal(first.status, 0, first.stderr);
    const state = JSON.parse(
      await readFile(join(dir, "standard-site-records.json"), "utf8"),
    );
    assert.equal(
      state.documents["blog-welcome"],
      "at://did:plc:test/site.standard.document/3mvkl76ao2222",
    );
    assert.equal(state.media.coverImage.mimeType, "image/png");
    assert.equal(state.media.icon.mimeType, "image/png");
    const second = run(publisher, dir, ["--import", mockPath]);
    assert.equal(second.status, 0, second.stderr);
    const database = JSON.parse(
      await readFile(join(dir, "fake-pds.json"), "utf8"),
    );
    assert.deepEqual(
      database.records["site.standard.publication/3mvkl76ao2222"].value.icon,
      state.media.icon,
    );
    assert.deepEqual(
      database.records["site.standard.document/3mvkl76ao2222"].value.coverImage,
      state.media.coverImage,
    );
    assert.equal(
      database.writes,
      2,
      "a second publish must not create duplicates or rewrite unchanged content",
    );
    database.records["site.standard.publication/3mvkl76ao2222"].value.url =
      "https://someone-else.invalid";
    await writeFile(join(dir, "fake-pds.json"), JSON.stringify(database));
    const conflict = run(publisher, dir, ["--import", mockPath]);
    assert.notEqual(conflict.status, 0);
    assert.match(conflict.stderr, /already belongs to another publication/);
  }));
test("static pages include verified AT URIs and readable content without JavaScript", () =>
  sandbox(async (dir) => {
    await mkdir(join(dir, "dist"));
    await writeFile(
      join(dir, "dist/index.html"),
      '<html><head><title>Desktop</title><meta name="description" content="Homepage" /></head><body><div id="root"></div></body></html>',
    );
    const publication =
      "at://did:plc:test/site.standard.publication/3mvkl76ao2222";
    const document = "at://did:plc:test/site.standard.document/3mvkl76ao2222";
    await writeFile(
      join(dir, "standard-site-records.json"),
      JSON.stringify({ publication, documents: { "blog-welcome": document } }),
    );
    const result = run(builder, dir);
    assert.equal(result.status, 0, result.stderr);
    const html = await readFile(
      join(dir, "dist/blog/welcome/index.html"),
      "utf8",
    );
    assert.ok(
      html.includes(`<link rel="site.standard.document" href="${document}"`),
    );
    assert.ok(
      html.includes(
        'property="og:image" content="https://erickrouss.github.io/assets/blog/blog-express-cover.png"',
      ),
    );
    assert.ok(
      html.includes('name="twitter:card" content="summary_large_image"'),
    );
    assert.ok(
      html.includes('href="https://erickrouss.github.io/blog/welcome/"'),
    );
    assert.ok(
      html.includes(
        "<noscript><article><h1>Welcome</h1><p>This is where my blogs will be</p>",
      ),
    );
    assert.equal(
      await readFile(
        join(dir, "dist/.well-known/site.standard.publication"),
        "utf8",
      ),
      publication,
    );
    const record = JSON.parse(
      await readFile(join(dir, "dist/standard-site/welcome.json"), "utf8"),
    );
    assert.equal(record.site, publication);
  }));
test("unauthenticated publishing fails before making a network request", () =>
  sandbox(async (dir) => {
    const result = spawnSync(process.execPath, [publisher], {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env,
        ATPROTO_IDENTIFIER: "",
        ATPROTO_APP_PASSWORD: "",
        ATPROTO_PDS: "https://test.invalid",
      },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Set ATPROTO_IDENTIFIER/);
  }));
