export async function readBlog() {
  const response = await fetch("/__dev/blog", { cache: "no-store" });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "Start npm run dev and open the site on localhost to use the composer.",
    );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not read the blog.");
  return data;
}
export async function writeBlog(input) {
  const response = await fetch("/__dev/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(data.error || "Could not save the blog."), {
      status: response.status,
    });
  return data;
}
export async function moveArticle(slug, category) {
  const data = await readBlog();
  return writeBlog({ action: "move", slug, category, revision: data.revision });
}
