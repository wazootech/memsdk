# memsdk

## The problem

Every AI memory backend ships its own SDK. Switching from Supermemory to Letta to
Mem0 means rewriting your app's memory layer from scratch. Common patterns like
add, search, forget, and list documents are the same, but the interface shapes
are different. That coupling is incidental, not architectural.

## The insight

Designing a new universal interface from scratch is tempting but rarely works.
Letta's own `ai-memory-sdk` (a simplified, differently-shaped memory SDK) went
stale in 8 months. This validates that inventing novel interface shapes is the
wrong approach.

Instead, freeze one that's already proven. Supermemory's API surface is the most
complete memory-domain interface available. It covers documents CRUD, hybrid
search, typed filters, memory lifecycle, and profiles. It is backed by an
OpenAPI spec and a Stainless-generated TypeScript SDK. It's the closest thing
to a publishable spec for what a memory backend should look like.

## What memsdk does

`memsdk` extracts Supermemory's public API surface into a backend-agnostic
TypeScript contract:

- **`SupermemoryInterface`**: a type-level contract for memory backends (480 lines)
- **Zod schemas**: runtime request validation (270 lines)
- **Zero runtime deps** beyond `zod`

Write app code against this interface, then swap backends by swapping the adapter.

```ts
import type { SupermemoryInterface } from "memsdk"

function buildApp(client: SupermemoryInterface) {
  // works against any backend that implements the contract
  const doc = await client.documents.add({ content: "..." })
  const results = await client.search.documents({ q: "..." })
  await client.memories.forget({ containerTag: "default", id: doc.id })
}
```

## Installation

`memsdk` is distributed directly from GitHub. It is not currently published to
the npm registry.

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

The package builds from source during installation via `prepare`, then exposes
the compiled ESM entrypoint and TypeScript declarations from `dist`.

### Runtime support

| Runtime | Status | Installation path |
| --- | --- | --- |
| Node.js | Supported | `npm install github:wazootech/memsdk` |
| pnpm/yarn projects | Supported | `pnpm add github:wazootech/memsdk` or `yarn add github:wazootech/memsdk` |
| Bun | Supported | `bun add github:wazootech/memsdk` |
| Vite/browser apps | Supported through bundling | Install as a package dependency, then import normally from app code |
| Deno | Not first-class yet | Use through npm/package-manager compatibility where available; direct URL imports are not documented yet |
| Browser/CDN | Not first-class yet | Requires a published package, release artifact, or committed browser build |

Because `memsdk` is primarily a TypeScript contract plus Zod schemas, browser and
edge use should go through a bundler today. Direct `<script>`/CDN usage is not a
supported distribution path yet.

## It works

- [**memsdk-e2e**](https://github.com/wazootech/memsdk-e2e): 10 conformance
  scenarios (add, search, forget, batch, upload, list...) run identically against
  Supermemory local and Letta Docker, producing a side-by-side report.
- [**memsdk-letta**](https://github.com/wazootech/memsdk-letta): a working Letta
  adapter in ~500 lines that implements `SupermemoryInterface` via
  `@letta-ai/letta-client`.
- **Type-level compatibility** is verified at compile time against the official
  `supermemory@4.24.12` npm package.

## Current scope

- SDK-shaped `SupermemoryInterface` for the memory-domain surface only.
- Vendored TypeScript types aligned with `supermemory@4.24.12` declarations.
- Awaitable `APIPromise<T>` compatibility for normal `await client...` usage.
- Runtime-portable library types for npm-compatible consumers across Node.js,
  Bun, Vite/browser bundles, and edge runtimes.

### Included surface

- `client.add(...)`
- `client.profile(...)`
- `client.documents.*`
- `client.search.*`
- `client.memories.*`

### Excluded for v0

Settings, connections, raw HTTP helpers, constructor/auth compatibility,
`Supermemory.local`, error classes, and hosted HTTP replacement.

## Validation

Run:

```sh
npm test
```

This repo's test suite checks two things:
- **Type-level compatibility** (`supermemory-sdk-compat.test-d.ts`): every `memsdk`
  type is a structural subtype of the corresponding type from the official
  `supermemory` npm package. This catches SDK API drift at compile time.
- **Synthetic schema sanity** (`supermemory-compat.test.ts`): hand-written fixtures
  (not server-recorded) validate Zod schema parsing and the interface's mockability.

The test suite does **not** observe a running Supermemory server. End-to-end
behavioral conformance lives in the separate
[`memsdk-e2e`](https://github.com/wazootech/memsdk-e2e) repo.

## Attribution

Supermemory is not affiliated with or endorsing this project unless stated
otherwise. Public Supermemory API and SDK references are used for
interoperability, attribution, and conformance purposes.

See `COMPATIBILITY.md` and `NOTICE` for pinned references and compatibility scope.
