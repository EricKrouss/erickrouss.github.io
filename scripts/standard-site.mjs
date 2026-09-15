import { postText } from "../src/blogFormatting.js";
import { blogPosts } from "../src/blogPosts.js";

export const publication = {
  $type: "site.standard.publication",
  url: "https://erickrouss.github.io",
  name: "Eric’s Blog Express",
  description: "Eric Krouss’s personal blog.",
};
export const artwork = {
  cover: "/assets/blog/blog-express-cover.png",
  icon: "/assets/blog/blog-express-icon.png",
  alt: "Eric’s Blog Express in a Windows 98 window, with the Outlook Express icon on a teal desktop.",
};
// Stable AT Protocol TIDs. Never change these after publication.
export const publicationKey = "3mvkl76ao2222";
const isTid = (value) =>
  /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/.test(value);
export function documentRecord(post, publicationUri = publication.url) {
  return {
    $type: "site.standard.document",
    site: publicationUri,
    title: post.title,
    path: `/blog/${post.slug}/`,
    publishedAt: post.publishedAt || `${post.date}T12:00:00.000Z`,
    ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),
    ...(post.excerpt ? { description: post.excerpt } : {}),
    tags: [post.category],
    textContent: postText(post),
  };
}
export function records(publicationUri) {
  const seen = new Set();
  const recordKeys = new Set();
  return blogPosts.map((post) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || seen.has(post.slug))
      throw new Error(`Invalid or duplicate blog slug: ${post.slug}`);
    seen.add(post.slug);
    if (!isTid(post.recordKey) || recordKeys.has(post.recordKey))
      throw new Error(
        `Invalid or duplicate AT Protocol recordKey for ${post.slug}. Generate one with npm run blog:new-key.`,
      );
    recordKeys.add(post.recordKey);
    const record = documentRecord(post, publicationUri);
    if (
      !record.title ||
      !record.textContent ||
      !Number.isFinite(Date.parse(record.publishedAt))
    )
      throw new Error(`Incomplete article: ${post.slug}`);
    return { key: `blog-${post.slug}`, rkey: post.recordKey, record };
  });
}
