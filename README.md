# memsdk

`memsdk` defines a Supermemory-compatible memory interface that any AI memory backend can implement.

The core API intentionally uses Supermemory-compatible shapes as the standard contract. Backends such as Worlds, Letta, Supermemory, or custom stores should implement these shapes directly rather than translating through a separate neutral model.

## Current scope

- Supermemory-compatible TypeScript request and response types.
- A `MemoryClient` implementation contract for add, update, get, list, search, and delete flows.
- Golden fixtures validated against vendored public Supermemory Zod schemas.

## Validation

Run:

```sh
npm test
```

The tests parse `memsdk` fixtures through a vendored subset of Supermemory's public Zod schemas from `supermemoryai/supermemory/packages/validation/api.ts`.
