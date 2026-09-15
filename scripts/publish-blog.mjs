import { writeFile } from "node:fs/promises";
import { publication, publicationKey, records } from "./standard-site.mjs";

// Credentials belong in shell/CI secrets, never VITE_* variables or source files.
const identifier = process.env.ATPROTO_IDENTIFIER;
const password = process.env.ATPROTO_APP_PASSWORD;
const pds = new URL(process.env.ATPROTO_PDS || "https://bsky.social");
if (pds.protocol !== "https:" || pds.username || pds.password)
  throw new Error("ATPROTO_PDS must be an HTTPS URL without credentials.");
if (process.argv.includes("--dry-run")) {
  console.log(JSON.stringify({ publication, documents: records() }, null, 2));
  process.exit(0);
}
if (!identifier || !password) {
  console.error(
    "Set ATPROTO_IDENTIFIER and ATPROTO_APP_PASSWORD in your shell or CI secrets. Set ATPROTO_PDS for a non-Bluesky PDS. Preview with npm run blog:preview-records.",
  );
  process.exit(1);
}
async function rpc(method, body, token, query) {
  const url = new URL(`/xrpc/${method}`, pds);
  if (query) url.search = new URLSearchParams(query).toString();
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json();
  if (!response.ok) {
    if (
      method === "com.atproto.repo.getRecord" &&
      data.error === "RecordNotFound"
    )
      return null;
    // Include record-validation diagnostics, never authentication response bodies.
    const details =
      method === "com.atproto.repo.putRecord"
        ? [data.error, data.message]
            .filter((value) => typeof value === "string")
            .join(": ")
            .slice(0, 600)
        : "";
    const safeDetails = [identifier, password, token]
      .filter(Boolean)
      .reduce(
        (message, secret) => message.replaceAll(secret, "<REDACTED>"),
        details,
      );
    throw new Error(
      `${method} failed (HTTP ${response.status})${safeDetails ? `: ${safeDetails}` : "."}`,
    );
  }
  return data;
}
const session = await rpc("com.atproto.server.createSession", {
  identifier,
  password,
});
const publicationUri = `at://${session.did}/site.standard.publication/${publicationKey}`;
const documents = records(publicationUri);
async function put(rkey, record) {
  const query = { repo: session.did, collection: record.$type, rkey };
  const existing = await rpc(
    "com.atproto.repo.getRecord",
    null,
    session.accessJwt,
    query,
  );
  if (
    existing &&
    (record.$type === "site.standard.publication"
      ? existing.value.url !== record.url
      : existing.value.site !== record.site ||
        existing.value.path !== record.path)
  ) {
    throw new Error(
      `Record ${rkey} already belongs to another publication or page.`,
    );
  }
  if (existing && JSON.stringify(existing.value) === JSON.stringify(record))
    return existing.uri;
  const result = await rpc(
    "com.atproto.repo.putRecord",
    { ...query, record, swapRecord: existing?.cid ?? null },
    session.accessJwt,
  );
  return result.uri;
}
const state = {
  publication: await put(publicationKey, publication),
  documents: {},
};
for (const { rkey, record } of documents) {
  state.documents[rkey] = await put(rkey, record);
  // Save after each successful write, so partial runs retain their verification links.
  await writeFile(
    "standard-site-records.json",
    JSON.stringify(state, null, 2) + "\n",
  );
}
console.log(
  `Published ${documents.length} Standard.site document(s). Run npm run build and deploy dist to serve their verification links.`,
);
