import type { AnnounceConfig, PricingDef } from '402-announce'
import type { TollBoothAnnounceOptions } from './types.js'
import { slugify } from './slugify.js'

/**
 * PriceInfo from toll-booth — dual-currency pricing.
 * Reproduced here to avoid importing toll-booth internals.
 */
interface PriceInfo {
  sats?: number
  usd?: number
}

/** Check if a value is a PriceInfo object (has sats or usd keys). */
function isPriceInfo(value: unknown): value is PriceInfo {
  return typeof value === 'object' && value !== null && ('sats' in value || 'usd' in value)
}

/**
 * Subset of BoothConfig fields relevant for announcement.
 * Kept minimal to avoid tight coupling to toll-booth internals.
 *
 * PricingEntry in toll-booth is: number | PriceInfo | TieredPricing
 * where TieredPricing = Record<string, number | PriceInfo>
 */
export interface BoothConfigLike {
  pricing: Record<string, number | PriceInfo | Record<string, number | PriceInfo>>
  serviceName?: string
  hasBackend?: boolean
  xcashu?: { mints: string[] }
  ietfPayment?: { realm: string }
}

/** Map a toll-booth config + user options to a 402-announce AnnounceConfig. */
export function mapBoothConfig(
  boothConfig: BoothConfigLike,
  options: TollBoothAnnounceOptions,
): AnnounceConfig {
  const name = boothConfig.serviceName ?? 'toll-booth'
  const identifier = options.identifier ?? slugify(name)

  const pricing: PricingDef[] = Object.entries(boothConfig.pricing).flatMap(([capability, value]) => {
    // Case 1: flat number price
    if (typeof value === 'number') {
      return [{ capability, price: value, currency: 'sats' }]
    }

    // Case 2: PriceInfo ({ sats?: number, usd?: number }) — emit both currencies when available
    if (isPriceInfo(value)) {
      const entries: PricingDef[] = []
      if (value.sats !== undefined) entries.push({ capability, price: value.sats, currency: 'sats' })
      if (value.usd !== undefined) entries.push({ capability, price: value.usd, currency: 'usd' })
      if (entries.length === 0) entries.push({ capability, price: 0, currency: 'sats' })
      return entries
    }

    // Case 3: TieredPricing (Record<string, number | PriceInfo>)
    // Use 'default' tier if present, otherwise lowest numeric value
    const tiers = value as Record<string, number | PriceInfo>
    const defaultTier = tiers.default
    if (defaultTier !== undefined) {
      if (typeof defaultTier === 'number') return [{ capability, price: defaultTier, currency: 'sats' }]
      const entries: PricingDef[] = []
      if (defaultTier.sats !== undefined) entries.push({ capability, price: defaultTier.sats, currency: 'sats' })
      if (defaultTier.usd !== undefined) entries.push({ capability, price: defaultTier.usd, currency: 'usd' })
      if (entries.length === 0) entries.push({ capability, price: 0, currency: 'sats' })
      return entries
    }

    // No default tier — find lowest sats price among numeric tiers
    const numericValues = Object.values(tiers)
      .map(v => typeof v === 'number' ? v : v.sats)
      .filter((v): v is number => v !== undefined)

    const price = numericValues.length > 0 ? Math.min(...numericValues) : 0
    return [{ capability, price, currency: 'sats' }]
  })

  // Auto-derive payment methods if not explicitly provided
  let paymentMethods = options.paymentMethods
  if (!paymentMethods) {
    paymentMethods = []
    if (boothConfig.hasBackend) paymentMethods.push(['l402', 'lightning'])
    if (boothConfig.ietfPayment) paymentMethods.push(['payment', 'lightning'])
    if (boothConfig.xcashu) paymentMethods.push(['xcashu'])
  }

  return {
    secretKey: options.secretKey,
    relays: options.relays,
    identifier,
    name,
    urls: options.urls,
    about: options.about,
    pricing,
    paymentMethods,
    ...(options.picture && { picture: options.picture }),
    ...(options.topics && { topics: options.topics }),
    ...(options.version && { version: options.version }),
  }
}
