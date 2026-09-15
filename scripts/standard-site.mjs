import { blogPosts } from "../src/blogPosts.js";

export const publication = {
  $type: "site.standard.publication",
  url: "https://erickrouss.github.io",
  name: "Eric’s Blog Express",
  description: "Eric Krouss’s personal blog.",
};
export const publicationKey = "eric-blog-express";
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
    textContent: post.body
      .flatMap((block) => [block.heading, ...block.paragraphs].filter(Boolean))
      .join("\n\n"),
  };
}
export function records(publicationUri) {
  const seen = new Set();
  return blogPosts.map((post) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || seen.has(post.slug))
      throw new Error(`Invalid or duplicate blog slug: ${post.slug}`);
    seen.add(post.slug);
    const record = documentRecord(post, publicationUri);
    if (
      !record.title ||
      !record.textContent ||
      !Number.isFinite(Date.parse(record.publishedAt))
    )
      throw new Error(`Incomplete article: ${post.slug}`);
    return { rkey: `blog-${post.slug}`, record };
  });
}
