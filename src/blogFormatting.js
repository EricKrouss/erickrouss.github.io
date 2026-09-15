export const isBlogImage = (src) =>
  /^\/assets\/blog\/uploads\/[a-f0-9]{64}\.(png|jpg|gif|webp)$/.test(src);
const escaped = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export function runsText(runs) {
  return runs.map((run) => run.text).join("");
}
export function blockText(block) {
  return [
    block.heading,
    block.image?.alt,
    ...(block.paragraphs || []),
    ...(block.list || []).map(runsText),
  ]
    .filter((text) => text !== undefined)
    .join("\n\n");
}
export function postText(post) {
  return post.body.map(blockText).join("\n\n");
}
export function runsHtml(runs) {
  return runs
    .map((run) => {
      let html = escaped(run.text).replace(/\n/g, "<br>");
      if (run.bold) html = `<strong>${html}</strong>`;
      if (run.italic) html = `<em>${html}</em>`;
      if (run.underline) html = `<u>${html}</u>`;
      return html;
    })
    .join("");
}
export function bodyHtml(body) {
  return body
    .map((block) => {
      let html = block.heading
        ? `<h${block.level === 3 ? 3 : 2}>${escaped(block.heading)}</h${block.level === 3 ? 3 : 2}>`
        : "";
      html += (block.paragraphs || [])
        .map(
          (p, index) =>
            `<p>${block.richText?.[index] ? runsHtml(block.richText[index]) : escaped(p).replace(/\n/g, "<br>")}</p>`,
        )
        .join("");
      if (block.list) {
        const tag = block.ordered ? "ol" : "ul";
        html += `<${tag}>${block.list.map((runs) => `<li>${runsHtml(runs)}</li>`).join("")}</${tag}>`;
      }
      if (block.image && isBlogImage(block.image.src))
        html += `<img src="${escaped(block.image.src)}" alt="${escaped(block.image.alt || "")}">`;
      return html;
    })
    .join("");
}
// Read a DOM tree into an allowlisted text model. HTML, scripts, styles and links are never stored.
export function blocksFromDom(root) {
  const blocks = [];
  const forbidden = new Set([
    "SCRIPT",
    "STYLE",
    "IFRAME",
    "OBJECT",
    "SVG",
    "MATH",
    "TEMPLATE",
  ]);
  function inline(node, marks = {}) {
    if (node.nodeType === 3)
      return node.textContent ? [{ text: node.textContent, ...marks }] : [];
    if (node.nodeType !== 1 || forbidden.has(node.tagName)) return [];
    if (node.tagName === "BR") return [{ text: "\n", ...marks }];
    const next = { ...marks };
    if (["B", "STRONG"].includes(node.tagName)) next.bold = true;
    if (["I", "EM"].includes(node.tagName)) next.italic = true;
    if (node.tagName === "U") next.underline = true;
    return [...node.childNodes].flatMap((child) => inline(child, next));
  }
  function paragraph(runs) {
    const text = runsText(runs);
    if (text.replace(/\n/g, "").length)
      blocks.push({ paragraphs: [text], richText: [runs] });
  }
  function walk(parent) {
    let pending = [];
    const flush = () => {
      paragraph(pending);
      pending = [];
    };
    for (const node of parent.childNodes) {
      if (node.nodeType === 1 && node.tagName === "IMG") {
        flush();
        const src = node.getAttribute("src");
        if (isBlogImage(src))
          blocks.push({
            image: {
              src,
              alt: (node.getAttribute("alt") || "").slice(0, 1000),
            },
          });
      } else if (node.nodeType === 1 && ["UL", "OL"].includes(node.tagName)) {
        flush();
        const list = [...node.children]
          .filter((child) => child.tagName === "LI")
          .map((child) => inline(child));
        if (list.length) blocks.push({ list, ordered: node.tagName === "OL" });
      } else if (node.nodeType === 1 && /^H[1-6]$/.test(node.tagName)) {
        flush();
        const heading = runsText(inline(node));
        if (heading.trim())
          blocks.push({
            heading,
            level: ["H1", "H2"].includes(node.tagName) ? 2 : 3,
          });
      } else if (
        node.nodeType === 1 &&
        ["P", "DIV", "SECTION", "BLOCKQUOTE"].includes(node.tagName)
      ) {
        flush();
        walk(node);
        flush();
      } else pending.push(...inline(node));
    }
    flush();
  }
  walk(root);
  return blocks;
}
