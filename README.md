# memsdk

`memsdk` provides drop-in TypeScript interface compatibility with Supermemory's public memory-domain SDK surface.

It is an independent interoperability project. The goal is to help memory backends implement the Supermemory-shaped TypeScript API so developers can build against a common AI memory interface.

## Current scope

- SDK-shaped `SupermemoryInterface` for the memory-domain surface only.
- Vendored TypeScript types aligned with `supermemory@4.24.12` declarations.
- Awaitable `APIPromise<T>` compatibility for normal `await client...` usage.
- Runtime-portable library types for npm consumers across Bun, Node.js, Deno, browsers, and edge runtimes.

## Included surface

- `client.add(...)`
- `client.profile(...)`
- `client.documents.*`
- `client.search.*`
- `client.memories.*`

Excluded for v0: settings, connections, raw HTTP helpers, constructor/auth compatibility, `Supermemory.local`, error classes, and hosted HTTP replacement.

## Attribution

Supermemory is not affiliated with or endorsing this project unless stated otherwise. Public Supermemory API and SDK references are used for interoperability, attribution, and conformance purposes.

See `COMPATIBILITY.md` and `NOTICE` for pinned references and compatibility scope.

## Validation

Run:

```sh
npm test
```

The test suite checks the exported TypeScript surface and keeps existing vendored Supermemory schema sanity checks.
