// The development composer saves here through blogData.json. Public builds are read-only.
import data from "./blogData.json" with { type: "json" };
export const blogPosts = data.posts;
export const blogCategories = data.categories;

export const deletedBlogPosts = data.deletedPosts || [];
