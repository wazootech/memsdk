# Agent guidelines

This file overrides the workspace root AGENTS.md for repo-specific guidance.

## What this repo is

This repository contains the core MemSDK package.

## How to work here

- Use `package.json` scripts as the source of truth for build, test, typecheck, and
  formatting commands.
- Run `npm run typecheck` and `npm test` for code changes when practical.
- Run `npm run build` before release-facing changes.
- Keep package exports and README examples aligned with implementation changes.

## Code health

Family-wide rules live in the
[wazootech workspace constitution](https://github.com/wazootech/workspace/blob/main/AGENTS.md#code-health-standards);
this repo's specifics:

- Before pushing, run `bun run format:check`, `bun run lint`, `bun run typecheck`, and
  `bun test`; CI runs the same checks. Lint uses `--max-warnings 0`.
- `@typescript-eslint/no-explicit-any` is an error; use real types or `unknown`.
- Workflow actions are pinned to full commit SHAs with a version comment; Bun is pinned
  through `packageManager`; installs are frozen (`bun install --frozen-lockfile`).
- `secret-scan.yml` runs gitleaks on every pull request and push to `main`.
  `code-health.yml` only warns and is listed in `.prettierignore` to stay identical to
  the org template. `CODEOWNERS` routes review to `@EthanThatOneKid`.
