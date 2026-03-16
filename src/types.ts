import type { Announcement } from '402-announce'

/** Options the user provides — fields that cannot be derived from BoothConfig. */
export interface TollBoothAnnounceOptions {
  /** 64-character hex Nostr secret key for signing the announcement event. */
  secretKey: string
  /** Nostr relay URLs to publish to (wss:// or ws://). */
  relays: string[]
  /** Public URL where the toll-booth service is accessible. */
  url: string
  /** Short human-readable description of the service. */
  about: string
  /** Accepted payment method identifiers (e.g. ['bitcoin-lightning-bolt11']). */
  paymentMethods?: string[]
  /** Optional identifier override. Defaults to slugified serviceName. */
  identifier?: string
  /** Optional icon URL. */
  picture?: string
  /** Optional topic tags for discoverability. */
  topics?: string[]
  /** Optional service version string. */
  version?: string
}

export type { Announcement }
