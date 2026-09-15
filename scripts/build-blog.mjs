import { mkdir, readFile, writeFile } from "node:fs/promises";
import { bodyHtml } from "../src/blogFormatting.js";
import { blogPosts } from "../src/blogPosts.js";
import { artwork, publication, records } from "./standard-site.mjs";

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
  JSON.stringify(
    {
      ...publication,
      ...(published.media?.icon ? { icon: published.media.icon } : {}),
    },
    null,
    2,
  ) + "\n",
);
for (const [index, { key, record }] of documents.entries()) {
  const post = blogPosts[index];
  const uri = published.documents[key];
  const canonical = `${publication.url}${record.path}`;
  const description = post.excerpt || record.textContent.slice(0, 200);
  const head =
    `<meta property="og:type" content="article" />
<meta property="og:title" content="${escape(post.title)} — Blog Express" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:url" content="${escape(canonical)}" />
<meta property="og:image" content="${publication.url}${artwork.cover}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escape(artwork.alt)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${publication.url}${artwork.cover}" />
<meta name="twitter:image:alt" content="${escape(artwork.alt)}" />
` +
    `<link rel="canonical" href="${escape(canonical)}" />\n` +
    (uri
      ? `<link rel="site.standard.document" href="${escape(uri)}" />\n`
      : "") +
    (published.publication
      ? `<link rel="site.standard.publication" href="${escape(published.publication)}" />\n`
      : "");
  const noScript = `<noscript><article><h1>${escape(post.title)}</h1>${bodyHtml(post.body)}<a href="/">Back to the desktop</a></article></noscript>`;
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
    JSON.stringify(
      {
        ...record,
        ...(published.media?.coverImage
          ? { coverImage: published.media.coverImage }
          : {}),
      },
      null,
      2,
    ) + "\n",
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
