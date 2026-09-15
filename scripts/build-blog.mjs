import { mkdir, readFile, writeFile } from "node:fs/promises";
import { blogPosts } from "../src/blogPosts.js";
import { publication, records } from "./standard-site.mjs";

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
let published = { documents: {} };
try {
  published = JSON.parse(await readFile("standard-site-records.json", "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const template = await readFile("dist/index.html", "utf8");
const documents = records(published.publication);
await mkdir("dist/standard-site", { recursive: true });
await writeFile(
  "dist/standard-site/publication.json",
  JSON.stringify(publication, null, 2) + "\n",
);
for (const [index, { rkey, record }] of documents.entries()) {
  const post = blogPosts[index];
  const uri = published.documents[rkey];
  const canonical = `${publication.url}${record.path}`;
  const description = post.excerpt || record.textContent.slice(0, 200);
  const head =
    `<link rel="canonical" href="${escape(canonical)}" />\n` +
    (uri
      ? `<link rel="site.standard.document" href="${escape(uri)}" />\n`
      : "") +
    (published.publication
      ? `<link rel="site.standard.publication" href="${escape(published.publication)}" />\n`
      : "");
  const noScript = `<noscript><article><h1>${escape(post.title)}</h1>${post.body.map((block) => `${block.heading ? `<h2>${escape(block.heading)}</h2>` : ""}${block.paragraphs.map((p) => `<p>${escape(p)}</p>`).join("")}`).join("")}<a href="/">Back to the desktop</a></article></noscript>`;
  const html = template
    .replace(
      /<title>.*?<\/title>/s,
      `<title>${escape(post.title)} — Blog Express</title>`,
    )
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escape(description)}" />`,
    )
    .replace("</head>", `${head}</head>`)
    .replace("</body>", `${noScript}</body>`);
  await mkdir(`dist/blog/${post.slug}`, { recursive: true });
  await writeFile(`dist/blog/${post.slug}/index.html`, html);
  await writeFile(
    `dist/standard-site/${post.slug}.json`,
    JSON.stringify(record, null, 2) + "\n",
  );
}
if (published.publication) {
  await mkdir("dist/.well-known", { recursive: true });
  await writeFile(
    "dist/.well-known/site.standard.publication",
    published.publication,
  );
}
console.log(
  `Built ${documents.length} article page(s) and Standard.site document export(s).`,
);
