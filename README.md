# toll-booth-announce

Announce your [toll-booth](https://github.com/TheCryptoDonkey/toll-booth) service on Nostr for decentralised paid API discovery.

Publishes a [kind 31402](https://github.com/TheCryptoDonkey/402-announce) event so AI agents and clients can find your API without a centralised registry.

## Install

```bash
npm install toll-booth-announce 402-announce
```

## Usage

```typescript
import { Booth } from '@thecryptodonkey/toll-booth'
import { phoenixdBackend } from '@thecryptodonkey/toll-booth/backends/phoenixd'
import { announce } from 'toll-booth-announce'

// Your existing toll-booth config
const config = {
  serviceName: 'sats-for-laughs',
  pricing: {
    '/api/joke': { default: 5, standard: 21, premium: 42 },
  },
  upstream: 'http://localhost:4444',
  backend: phoenixdBackend({ /* ... */ }),
  freeTier: { requestsPerDay: 3 },
}

const booth = new Booth(config)

// Announce on Nostr — pricing and name derived from config
const announcement = await announce(config, {
  secretKey: process.env.NOSTR_SK,
  relays: ['wss://relay.damus.io', 'wss://relay.primal.net'],
  urls: ['https://jokes.trotters.dev'],
  about: 'Lightning-paid joke API — cracker, standard, and premium jokes',
  paymentMethods: [['l402', 'lightning']],
  topics: ['jokes', 'humour', 'bitcoin', 'lightning'],
})

console.log(`Announced as ${announcement.pubkey} (event ${announcement.eventId})`)

// On shutdown
announcement.close()
```

**Multi-transport example** (clearnet + Tor — same service, different access paths):

```typescript
const announcement = await announce(config, {
  secretKey: process.env.NOSTR_SK,
  relays: ['wss://relay.damus.io', 'wss://relay.primal.net'],
  urls: [
    'https://jokes.trotters.dev',          // clearnet
    'http://jokesxyz...onion',             // Tor hidden service
  ],
  about: 'Lightning-paid joke API — cracker, standard, and premium jokes',
  paymentMethods: [['l402', 'lightning']],
  topics: ['jokes', 'humour', 'bitcoin', 'lightning'],
})
```

`urls` accepts 1–10 entries. Clients try them in order and use whichever they can reach.

## Multiple URLs vs multiple events

**Multiple URLs in one event** — use `urls: ['...', '...']` when the URLs are the **same service** on different transports (clearnet, Tor, Handshake). Pricing, macaroon key, and credits are shared. This provides censorship resistance and redundancy.

**Separate kind 31402 events** — publish a new announcement with a different `identifier` when you have **genuinely different services**: separate pricing, separate capabilities, or services that operate independently.

In short: same service + different network paths → one event with multiple URLs. Different services → separate events.

## What gets announced

The bridge reads your toll-booth config and publishes a Nostr event with:

| Field | Source |
|-------|--------|
| Service name | `config.serviceName` (defaults to `"toll-booth"`) |
| Pricing | `config.pricing` table — flat or tiered (uses default/lowest tier) |
| Identifier | Slugified service name (overridable) |

You provide the fields toll-booth can't know: your public URL, description, Nostr key, relays, and payment methods.

## Part of the 402-announce ecosystem

This is one of several bridges that publish kind 31402 events for paid API discovery:

- **toll-booth-announce** — for toll-booth services (TypeScript)
- **aperture-announce** — for Lightning Labs Aperture proxies (Go)

Any client querying Nostr for kind 31402 events can discover your service. See [402-mcp](https://github.com/TheCryptoDonkey/402-mcp) for an AI agent that does this automatically.

## Licence

MIT
