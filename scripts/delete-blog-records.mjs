// A deletion is queued by the local editor, then applied by the authenticated deployment.
export async function deleteBlogRecords(
  deleted,
  active,
  publicationUri,
  repo,
  request,
) {
  for (const post of deleted) {
    if (active.some((item) => item.rkey === post.recordKey)) continue;
    if (
      !/^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/.test(
        post.recordKey,
      ) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)
    )
      throw new Error("Invalid queued blog deletion.");
    const query = {
      repo,
      collection: "site.standard.document",
      rkey: post.recordKey,
    };
    const existing = await request("com.atproto.repo.getRecord", null, query);
    if (!existing) continue;
    if (
      existing.value.site !== publicationUri ||
      existing.value.path !== `/blog/${post.slug}/`
    )
      throw new Error(
        `Refusing to delete a record belonging to another article: ${post.slug}`,
      );
    await request("com.atproto.repo.deleteRecord", {
      ...query,
      swapRecord: existing.cid,
    });
  }
}
