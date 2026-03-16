# Contributing to toll-booth-announce

## Setup

```bash
git clone https://github.com/TheCryptoDonkey/toll-booth-announce.git
cd toll-booth-announce
pnpm install
pnpm build
```

## Development

```bash
pnpm test          # run tests once
pnpm test:watch    # watch mode
pnpm build         # compile TypeScript
```

## Project structure

```
src/
  index.ts      — public exports
  announce.ts   — main entry point (maps config, calls 402-announce)
  mapper.ts     — BoothConfigLike → AnnounceConfig
  slugify.ts    — service name → URL-safe d-tag
  types.ts      — TollBoothAnnounceOptions, Announcement re-export

tests/
  announce.test.ts
  mapper.test.ts
  slugify.test.ts
```

## Conventions

- **British English** — colour, behaviour, licence, decentralised
- **Commit messages** — `type: description` (e.g. `feat:`, `fix:`, `docs:`, `refactor:`)
- **Tests** — vitest. Add tests for any new functionality.
- **Types** — keep `BoothConfigLike` minimal to avoid tight coupling to toll-booth internals

## Submitting changes

1. Fork the repo and create a branch from `main`
2. Make your changes and add tests
3. Run `pnpm build && pnpm test` to verify
4. Open a pull request against `main`

Semantic-release handles versioning and publishing automatically on merge to main.
