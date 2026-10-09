# memsdk

## The problem

Every AI memory backend ships its own SDK. Switching from Supermemory to Letta to Mem0
means rewriting your app's memory layer from scratch. Common patterns like add, search,
forget, and list documents are the same, but the interface shapes are different. That
coupling is incidental, not architectural.

## The insight

Designing a new universal interface from scratch is tempting but rarely works. Letta's
own `ai-memory-sdk` (a simplified, differently-shaped memory SDK) went stale in 8
months. This validates that inventing novel interface shapes is the wrong approach.

Instead, freeze one that's already proven. Supermemory's API surface is the most
complete memory-domain interface available. It covers namespaced documents CRUD, hybrid
search, typed filters, memory lifecycle, and profiles. It is backed by an OpenAPI spec
(API v5) and a generated TypeScript SDK. It's the closest thing to a publishable spec
for what a memory backend should look like.

## What memsdk does

`memsdk` extracts Supermemory's public API surface into a backend-agnostic TypeScript
contract:

- **`SupermemoryInterface`**: a type-level contract for memory backends (~580 lines)
- **Zod schemas**: runtime request validation (~260 lines)
- **Zero runtime deps** beyond `zod`

Write app code against this interface, then swap backends by swapping the adapter.

The contract follows Supermemory API v5: every content operation is scoped to a
**namespace** (formerly a container tag), passed as the first positional argument, then
any other URL values, then one options object.

```ts
import type { SupermemoryInterface } from "memsdk"

async function buildApp(client: SupermemoryInterface) {
  // works against any backend that implements the contract
  const doc = await client.add("user_alex", { content: "...", dreaming: "instant" })
  const { results } = await client.search("user_alex", {
    query: "...",
    searchMode: "hybrid",
    filter: { field: "source", operator: "eq", value: "chat" },
  })
  const profile = await client.profileMarkdown("user_alex")
  await client.documents.delete("user_alex", { ids: [doc.id] })
}
```

## Installation

`memsdk` is distributed directly from GitHub. It is not currently published to the npm
registry.

Install with any npm-compatible package manager:

```sh
npm install github:wazootech/memsdk
pnpm add github:wazootech/memsdk
yarn add github:wazootech/memsdk
bun add github:wazootech/memsdk
```

For reproducible installs, pin to a tag or commit:

```sh
npm install github:wazootech/memsdk#<tag-or-commit>
```

The package builds from source during installation via `prepare`, then exposes the
compiled ESM entrypoint and TypeScript declarations from `dist`.

### Runtime support

`memsdk` is plain ESM compiled with `tsc`, `zod` is the only runtime dependency, and the
package declares no `engines` constraint. Runtime support therefore comes down to how
the package is resolved, not to runtime-specific code:

| Runtime       | Status                    | Resolution path                                                                                   |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| Node.js       | Supported                 | Any npm-compatible package manager (`npm`, `pnpm`, `yarn`)                                        |
| Bun           | Supported                 | `bun add github:wazootech/memsdk`                                                                 |
| Vite/browser  | Supported through bundler | Package dependency, then import normally from app code                                            |
| Edge runtimes | Supported through bundler | Package dependency, bundled by the platform deployer                                              |
| Deno          | Not first-class yet       | Blocked by distribution channel, not the runtime: `npm:` specifiers need an npm-registry artifact |
| Browser/CDN   | Not first-class yet       | Blocked by distribution channel: esm.sh/jsdelivr/unpkg resolve npm packages                       |

Because `memsdk` is primarily a TypeScript contract plus Zod schemas, browser and edge
use should go through a bundler today. Direct `<script>`/CDN usage is not a supported
distribution path yet. Publishing to the npm registry would unblock Deno `npm:`
specifiers, browser CDNs, and edge registries from a single artifact.

## It works

- **Type-level compatibility** is verified at compile time against the official
  `supermemory@5.0.1` npm package, in both directions: every request and response type
  matches the SDK's key-for-key, and the official client is itself assignable to
  `SupermemoryInterface`.
- [**memsdk-e2e**](https://github.com/wazootech/memsdk-e2e): 10 conformance scenarios
  run identically against Supermemory local and Letta Docker. Verified against the v4
  contract; the v5 port is tracked in
  [#21](https://github.com/wazootech/memsdk/issues/21).
- [**memsdk-letta**](https://github.com/wazootech/memsdk-letta): a Letta adapter that
  implements `SupermemoryInterface` via `@letta-ai/letta-client`. Verified against the
  v4 contract; the v5 port is tracked in
  [#21](https://github.com/wazootech/memsdk/issues/21).

## Current scope

- SDK-shaped `SupermemoryInterface` for the v5 memory-domain surface only.
- Vendored TypeScript types aligned with `supermemory@5.0.1` declarations.
- Awaitable `APIPromise<T>` compatibility for normal `await client...` usage, with
  optional `withRawResponse()`.
- Per-call `RequestOptions` (`timeoutInSeconds`, `maxRetries`, `abortSignal`, `headers`,
  ...) matching the SDK.
- Runtime-portable library types for npm-compatible consumers across Node.js, Bun,
  Vite/browser bundles, and edge runtimes.

### Included surface

- `client.add(namespace, ...)`
- `client.search(namespace, ...)`
- `client.profile(namespace, ...)` and `client.profileMarkdown(namespace, ...)`
- `client.list(namespace, "documents" | "chunks" | "memories", ...)`
- `client.documents.{get,update,delete,batchAdd,uploadFile}`
- `client.memories.{get,forget,forgetMatching}`

Optional interfaces that adapters may implement, not required by `SupermemoryInterface`:
`SupermemoryDocumentFilesInterface` (`replaceWithFile`/`updateFile`),
`SupermemoryProfilesInterface` (buckets), and `SupermemoryNamespacesInterface`.

### Excluded

Connectors, organization settings, raw HTTP helpers, constructor/auth compatibility,
error classes, and hosted HTTP replacement.

### Migrating an adapter from the v4 contract

See the v4 → v5 tables in `COMPATIBILITY.md`.

## Validation

Requires [Bun](https://bun.sh) (version pinned in `package.json` via `packageManager`).

Run:

```sh
bun install
bun test
bun run typecheck
```

This repo's test suite checks two things:

- **Type-level compatibility** (`supermemory-sdk-compat.test-d.ts`): every `memsdk`
  request and response type is mutually assignable with, and has the same keys at every
  depth as, the corresponding type from the official `supermemory` npm package. This
  catches SDK API drift at compile time.
- **Synthetic schema sanity** (`supermemory-compat.test.ts`): hand-written fixtures (not
  server-recorded) validate Zod schema parsing and the interface's mockability.

A weekly scheduled CI job (also runnable via `workflow_dispatch`) checks for upstream
drift: `bun run drift:sdk` typechecks the contract against `supermemory@latest`, and
`bun run drift:openapi` compares the live v5 OpenAPI operation list against
`test/fixtures/openapi-v5.operations.txt`.

The test suite does **not** observe a running Supermemory server. End-to-end behavioral
conformance lives in the separate
[`memsdk-e2e`](https://github.com/wazootech/memsdk-e2e) repo.

## Attribution

Supermemory is not affiliated with or endorsing this project unless stated otherwise.
Public Supermemory API and SDK references are used for interoperability, attribution,
and conformance purposes.

See `COMPATIBILITY.md` and `NOTICE` for pinned references and compatibility scope.
