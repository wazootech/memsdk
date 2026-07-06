# Compatibility

`memsdk` targets drop-in TypeScript interface compatibility with Supermemory's public memory-domain SDK surface.

## Pinned References

- SDK reference: `supermemory@4.24.12`
- SDK git head: `6cfb1ac4d06e7014a49c2a8f1882e6a7404c2b1f`
- Canonical OpenAPI reference: `https://api.supermemory.ai/v3/openapi`
- OpenAPI version observed: `3.0.0`

## Evidence Levels

- SDK surface: source of truth for v0 TypeScript method names, resource nesting, exported type names, `Uploadable`, `RequestOptions`, and normal awaitable method signatures.
- OpenAPI: canonical HTTP/schema reference used to understand endpoints and detect drift.
- Oracle behavior: exploratory local Supermemory probes may be used to derive future behavior conformance cases, but raw observations are not automatically normative.

## Included V0 Surface

- `client.add(...)`
- `client.profile(...)`
- `client.documents.add(...)`
- `client.documents.batchAdd(...)`
- `client.documents.update(...)`
- `client.documents.get(...)`
- `client.documents.list(...)`
- `client.documents.delete(...)`
- `client.documents.deleteBulk(...)`
- `client.documents.listProcessing(...)`
- `client.documents.uploadFile(...)`
- `client.search.documents(...)`
- `client.search.execute(...)`
- `client.search.memories(...)`
- `client.memories.forget(...)`
- `client.memories.updateMemory(...)`

## Excluded V0 Surface

- `client.settings.*`
- `client.connections.*`
- Raw `get/post/patch/put/delete` request helpers
- Constructor, auth, retries, and client lifecycle compatibility
- `Supermemory.local(...)`
- Error classes
- Hosted HTTP route-compatible service

## Known OpenAPI/SDK Drift

- OpenAPI includes memory-domain endpoints not exposed by `supermemory@4.24.12`, including direct memory create/list/forget-matching and document chunks/file-url endpoints.
- OpenAPI includes fields not present in SDK params, including `filterByMetadata`, `dreaming`, profile `include`, and profile `buckets`.
- Multipart upload types differ: the SDK exposes TypeScript ergonomics such as `Uploadable`, `containerTags?: string`, and `metadata?: string` that OpenAPI cannot fully represent.
- `client.search.documents(...)` and `client.search.execute(...)` are distinct SDK methods and types even though both map to `POST /v3/search`.

For v0, SDK TypeScript compatibility wins over raw OpenAPI shape when they differ.

## Letta Backend Pinning (memsdk-letta)

- SDK reference: `@letta-ai/letta-client@^1.12.1` (resolved: `1.12.1`)
- Runtime: Letta Docker `letta/letta:latest` connected to Ollama (LLM + embedding models)
- Embedding: inline `embedding_config` with `embedding_endpoint_type:"ollama"`, `embedding_model:"nomic-embed-text"`, `embedding_dim:768`
- LLM: any Ollama model discovered by the Letta server (e.g. `qwen2.5:3b`)
- e2e conformance verified at 10/10 parity with Supermemory local server (v0.0.3)

### SDK Behavioral Notes

- `passages.create` returns `Array<Passage>` (always an array); use `result[0]` for the created passage
- `passages.list` returns `Array<Passage>` (not paginated); iterate directly
- `agents.blocks.update(blockLabel, params)` takes a block **label** (e.g. `"human"`, `"persona"`), not a block ID — list blocks first to find the right label
- `blocks.list` returns `PagePromise`; extract `.data` for the array of blocks
- `passages.search` returns `{ count, results: Array<{ id, content, timestamp }> }` — `score` and `metadata` are present at runtime but not declared in the SDK types
- `Passage.id` is optional (`?: string`); guard with `if (!passage.id)` before caching

## Conformance Tiers

- Required interface conformance: method/resource shape exists, params/responses type-check, methods are awaitable.
- Required behavior conformance: core add/get/list/search/update/delete flows and persistence within a test run. Verified 10/10 on Supermemory local server (v0.0.3) and Letta Docker via memsdk-e2e.
- Optional capability conformance: `uploadFile` behavior (verified passing on both backends per inline `embedding_config`; gated per-backend), `asResponse()`, `withResponse()`, exact transport options, and exact error classes/messages.
