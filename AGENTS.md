# Agent guidelines

## What this repo is

This repository contains the core MemSDK package.

## How to work here

- Use `package.json` scripts as the source of truth for build, test, typecheck, and
  formatting commands.
- Run `npm run typecheck` and `npm test` for code changes when practical.
- Run `npm run build` before release-facing changes.
- Keep package exports and README examples aligned with implementation changes.
