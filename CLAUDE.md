# CLAUDE.md — toll-booth-announce

Bridge between toll-booth (L402 middleware) and 402-announce (Nostr kind 31402 service discovery).

## Build & test

```bash
pnpm build        # tsc
pnpm test         # vitest run
pnpm test:watch   # vitest (watch mode)
```

## Architecture

```
src/
  index.ts      — public exports (announce, BoothConfigLike, types)
  announce.ts   — main entry point: maps config then calls 402-announce
  mapper.ts     — BoothConfigLike → AnnounceConfig (pricing extraction, payment method derivation)
  slugify.ts    — service name → URL-safe d-tag identifier
  types.ts      — TollBoothAnnounceOptions, re-exports Announcement

tests/
  announce.test.ts
  mapper.test.ts
  slugify.test.ts
```

## Dev setup

Requires `402-announce` as a sibling directory (`file:../402-announce` in package.json). Clone both repos side-by-side before `pnpm install`.

## Conventions

- British English (colour, behaviour, licence, decentralised)
- Commit messages: `type: description` (feat:, fix:, docs:, refactor:)
- No Co-Authored-By lines in commits
- Semantic-release auto-publishes on push to main — do not manually bump version
- Peer dependency on @thecryptodonkey/toll-booth — keep BoothConfigLike minimal to avoid tight coupling

## Key design decisions

- ESM-only package (`"type": "module"`) — no CJS build
- `BoothConfigLike` reproduces only the subset of toll-booth types needed, avoiding a direct import of toll-booth internals
- Payment methods are auto-derived from config (hasBackend → lightning, xcashu → cashu) but can be overridden
- Pricing extraction handles three formats: flat number, PriceInfo ({sats, usd}), and tiered (Record with default key)
- `urls` field accepts 1–10 entries for multi-transport censorship resistance (clearnet, Tor, etc.)
