# Compatibility

`memsdk` targets drop-in TypeScript interface compatibility with Supermemory's public
memory-domain SDK surface, as of **Supermemory API v5**. API v3 and v4 are deprecated
upstream and shut down on 2026-12-31; `memsdk` no longer describes them.

## Pinned References

- SDK reference: `supermemory@5.0.1` (npm `latest` dist-tag, published 2026-10-06)
- SDK git head: `0ec1ac77e0d35a0b9440a08b2d2331f43fcc56ba` (npm `gitHead` for `5.0.1`)
- Canonical OpenAPI reference:
  [https://api.supermemory.ai/v5/openapi](https://api.supermemory.ai/v5/openapi)
- OpenAPI version observed: `3.1.0` (API `info.version` `5.0.0`)
- OpenAPI operation snapshot: `test/fixtures/openapi-v5.operations.txt` (32 operations)
- Upstream migration guide:
  [https://supermemory.ai/migration/api-v5](https://supermemory.ai/migration/api-v5)

## Evidence Levels

- SDK surface evidence: source of truth for TypeScript method names, positional
  arguments, resource nesting, exported type names, `Uploadable`, `RequestOptions`, and
  awaitable method signatures. Verified at compile time against the official
  `supermemory@5.0.1` package: every request and response type is mutually assignable
  and key-for-key identical at every depth, and the official client is assignable to
  `SupermemoryInterface` and each optional resource interface.
- OpenAPI evidence: canonical HTTP/schema reference used for Zod schema bounds and
  defaults and to detect endpoint drift.
- Synthetic schema fixtures: hand-written test data used for Zod schema sanity checks.
  These are plausible examples, not captured from a live server. See
  `test/supermemory-compat.test.ts`.
- Observed server fixtures: not yet included in this repo.
- External behavioral evidence: [`memsdk-e2e`](https://github.com/wazootech/memsdk-e2e)
  runs 11 conformance scenarios against Supermemory local and Letta Docker. Against the
  v5 contract (2026-10-08): Letta Docker passes 11/11 with no skips; Supermemory local
  is blocked because the latest local server (`supermemory-server` 0.0.8) serves only
  v3/v4 routes and returns 404 for `/ns/{namespace}/*`. The earlier 10/10 parity on both
  backends was measured against the v4 contract.

## Call Convention

URL values come first as positional arguments, then one object holding query parameters
and body together, then optional per-call `RequestOptions`:

```ts
await client.add("user_alex", { content: "...", dreaming: "instant" })
await client.documents.get("user_alex", "doc-1", { include: ["chunks"] })
await client.list("user_alex", "memories", { limit: 20 })
```

## Included Surface

Required by `SupermemoryInterface`:

| Method                                                         | HTTP                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| `client.add(namespace, request)`                               | `POST /ns/{namespace}/document`                          |
| `client.search(namespace, request)`                            | `POST /ns/{namespace}/search`                            |
| `client.profile(namespace, request?)`                          | `POST /ns/{namespace}/profile` (JSON)                    |
| `client.profileMarkdown(namespace, request?)`                  | `POST /ns/{namespace}/profile` (`Accept: text/markdown`) |
| `client.list(namespace, type, request?)`                       | `POST /ns/{namespace}/list/{type}`                       |
| `client.documents.get(namespace, id, request?)`                | `GET /ns/{namespace}/document/{id}`                      |
| `client.documents.update(namespace, id, request?)`             | `PATCH /ns/{namespace}/document/{id}`                    |
| `client.documents.delete(namespace, { ids })`                  | `DELETE /ns/{namespace}/document`                        |
| `client.documents.batchAdd(namespace, request)`                | `POST /ns/{namespace}/document/batch`                    |
| `client.documents.uploadFile(namespace, request)`              | `POST /ns/{namespace}/document/file`                     |
| `client.memories.get(namespace, id, request?)`                 | `GET /ns/{namespace}/memories/{id}`                      |
| `client.memories.forget(namespace, { ids })`                   | `DELETE /ns/{namespace}/memories`                        |
| `client.memories.forgetMatching(namespace, { query, dryRun })` | `DELETE /ns/{namespace}/memories/semantic`               |

Optional interfaces (exported, verified against the SDK, not required by
`SupermemoryInterface`):

- `SupermemoryDocumentFilesInterface`: `documents.replaceWithFile`,
  `documents.updateFile`
- `SupermemoryProfilesInterface`: `profiles.getBuckets`, `setBuckets`, `deleteBuckets`
- `SupermemoryNamespacesInterface`: `namespaces.list`, `get`, `update`, `delete`

## Excluded Surface

- `client.connectors.*` and `client.organization.*`
- Constructor, auth, base URL, and client lifecycle compatibility
- Error classes (`SupermemoryError`, `NotFoundError`, ...)
- Hosted HTTP route-compatible service

Per-call `RequestOptions` and `withRawResponse()` are included only because the method
signatures must match; `withRawResponse` is optional for adapters.

## v4 → v5 Migration (for adapter authors)

| v4 contract                                            | v5 contract                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `add({ content, containerTag, customId })`             | `add(namespace, { content, id })`                             |
| `documents.add(...)`                                   | removed; use `add(namespace, ...)`                            |
| `documents.get(id)` / `update(id, ...)`                | `documents.get(namespace, id)` / `update(namespace, id, ...)` |
| `documents.delete(id)` / `deleteBulk({ ids })`         | `documents.delete(namespace, { ids })`                        |
| `documents.list({ containerTags })`                    | `list(namespace, "documents", { filter? })`                   |
| `documents.listProcessing()`                           | removed                                                       |
| `search({ q, containerTag })` / `search.memories(...)` | `search(namespace, { query, searchMode: "memories" })`        |
| `search.documents(...)` / `search.execute(...)`        | `search(namespace, { query, searchMode: "chunks" })`          |
| `profile({ containerTag, q })`                         | `profile(namespace)`, then `search(namespace, { query })`     |
| `memories.forget({ containerTag, id })`                | `memories.forget(namespace, { ids })`                         |
| `memories.updateMemory(...)`                           | removed; update the source document                           |

| v4 field                          | v5 field                                   |
| --------------------------------- | ------------------------------------------ |
| `containerTag` / `containerTags`  | the `namespace` argument (same values)     |
| `customId`                        | `id`                                       |
| `entityContext`                   | `supportingContext`                        |
| `filterByMetadata`                | `group`                                    |
| `documentDate`                    | `date`                                     |
| `q`                               | `query`                                    |
| `filters`                         | `filter` (typed `FilterExpression`)        |
| `rerank: boolean` + `aggregate`   | `rerank: "none" \| "order" \| "aggregate"` |
| `searchMode: "documents"`         | `searchMode: "chunks"`                     |
| `timing` / `total`                | `searchTime`                               |
| `RequestOptions.timeout` (ms)     | `RequestOptions.timeoutInSeconds`          |
| `RequestOptions.signal`           | `RequestOptions.abortSignal`               |
| `asResponse()` / `withResponse()` | `withRawResponse()`                        |

Defaults changed: search `threshold` is `0.3` (was `0.6`) and `searchMode` is `hybrid`
(was `memories`). Memories appear quickly after `add` only with `dreaming: "instant"`.

## Known OpenAPI/SDK Drift

- OpenAPI exposes `GET /ns`, `GET /namespaces`, and `POST /feedback`, which have no SDK
  method in `supermemory@5.0.1`.
- `profileMarkdown` is a hand-written SDK method (not generated); OpenAPI models it as a
  `text/markdown` response variant of `POST /ns/{namespace}/profile`.
- Multipart upload fields `metadata` and `group` are JSON-encoded strings in the SDK,
  while the JSON `add`/`update` bodies take objects.
- `Uploadable`: `memsdk` accepts `ArrayBuffer`/`ArrayBufferView`/`Blob`/`File`/
  `ReadableStream` plus `{ path }` and `{ data }` wrappers. The SDK additionally accepts
  Node `Buffer`/`stream.Readable`, omitted here to keep `memsdk` free of `@types/node`.
  The drift guard checks this direction only: every `memsdk` upload value is accepted by
  the SDK.

For the contract, SDK TypeScript compatibility wins over raw OpenAPI shape when they
differ.

## Refreshing the Pin

A scheduled CI job runs weekly (Mondays 14:00 UTC; also `workflow_dispatch`):

- `bun run drift:sdk` installs `supermemory@latest` and runs `bun run typecheck`.
- `bun run drift:openapi` diffs the live OpenAPI operation list against the snapshot.

When either fails, whoever picks up the failure opens one PR that:

1. Bumps the `supermemory` devDependency (exact version) and fixes the contract types.
2. Runs `bun run drift:openapi --write` to refresh the operation snapshot.
3. Updates `supermemoryCompatibility` in `src/index.ts` and the Pinned References and
   Known Drift sections above.

## Letta Backend Pinning (memsdk-letta)

The adapter targets the v5 contract (memsdk-letta#10) and passes all 11 memsdk-e2e
scenarios against Letta Docker. Behavior specific to Letta's immutable passages
(stable-id alias map, `forgetMatching` unsupported) is documented in that repo.

- SDK reference: `@letta-ai/letta-client@^1.12.1` (resolved: `1.12.1`)
- Runtime: Letta Docker `letta/letta:latest` connected to Ollama (LLM + embedding
  models)
- Embedding: inline `embedding_config` with `embedding_endpoint_type:"ollama"`,
  `embedding_model:"nomic-embed-text"`, `embedding_dim:768`
- LLM: any Ollama model discovered by the Letta server (e.g. `qwen2.5:3b`)
- e2e conformance: 11/11 on v5 (2026-10-08); see
  [memsdk-e2e](https://github.com/wazootech/memsdk-e2e) for details.

### SDK Behavioral Notes

- `passages.create` returns `Array<Passage>` (always an array); use `result[0]` for the
  created passage
- `passages.list` returns `Array<Passage>` (not paginated); iterate directly
- `agents.blocks.update(blockLabel, params)` takes a block **label** (e.g. `"human"`,
  `"persona"`), not a block ID. List blocks first to find the right label.
- `blocks.list` returns `PagePromise`; extract `.data` for the array of blocks
- `passages.search` returns `{ count, results: Array<{ id, content, timestamp }> }`. The
  `score` and `metadata` fields are present at runtime but not declared in the SDK
  types.
- `Passage.id` is optional (`?: string`); guard with `if (!passage.id)` before caching

## Conformance Tiers

- Required interface conformance: method/resource shape exists, params/responses
  type-check, methods are awaitable.
- Required behavior conformance: core add/get/list/search/update/delete flows and
  persistence within a test run. Verified against v5 on Letta Docker (11/11) via
  external [memsdk-e2e](https://github.com/wazootech/memsdk-e2e); Supermemory local is
  blocked on a v5-capable local server. Not reproduced by `bun test` in this repo.
- Optional capability conformance: `uploadFile` behavior, the optional resource
  interfaces, `withRawResponse()`, exact transport options, and exact error
  classes/messages.
