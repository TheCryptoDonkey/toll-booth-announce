import { describe, it, expect } from 'vitest'
import { mapBoothConfig } from '../src/mapper.js'
import type { TollBoothAnnounceOptions } from '../src/types.js'

const baseOptions: TollBoothAnnounceOptions = {
  secretKey: 'a'.repeat(64),
  relays: ['wss://relay.example.com'],
  urls: ['https://example.com'],
  about: 'Test service',
  paymentMethods: ['bitcoin-lightning-bolt11'],
}

describe('mapBoothConfig', () => {
  it('maps serviceName to name', () => {
    const result = mapBoothConfig({ serviceName: 'My API', pricing: { '/test': 10 } }, baseOptions)
    expect(result.name).toBe('My API')
  })

  it('defaults name to "toll-booth" when serviceName is absent', () => {
    const result = mapBoothConfig({ pricing: { '/test': 10 } }, baseOptions)
    expect(result.name).toBe('toll-booth')
  })

  it('generates identifier from serviceName via slugify', () => {
    const result = mapBoothConfig({ serviceName: 'Valhalla Routing', pricing: { '/route': 2 } }, baseOptions)
    expect(result.identifier).toBe('valhalla-routing')
  })

  it('uses explicit identifier override when provided', () => {
    const opts = { ...baseOptions, identifier: 'custom-id' }
    const result = mapBoothConfig({ serviceName: 'Valhalla Routing', pricing: { '/route': 2 } }, opts)
    expect(result.identifier).toBe('custom-id')
  })

  it('maps flat pricing (number values)', () => {
    const result = mapBoothConfig({
      pricing: { '/route': 2, '/isochrone': 5 },
    }, baseOptions)
    expect(result.pricing).toEqual([
      { capability: '/route', price: 2, currency: 'sats' },
      { capability: '/isochrone', price: 5, currency: 'sats' },
    ])
  })

  it('maps PriceInfo pricing (dual-currency object with sats)', () => {
    const result = mapBoothConfig({
      pricing: { '/route': { sats: 2, usd: 1 } },
    }, baseOptions)
    expect(result.pricing).toEqual([
      { capability: '/route', price: 2, currency: 'sats' },
    ])
  })

  it('maps PriceInfo pricing with only usd (no sats) using usd price and currency', () => {
    const result = mapBoothConfig({
      pricing: { '/route': { usd: 100 } },
    }, baseOptions)
    expect(result.pricing).toEqual([
      { capability: '/route', price: 100, currency: 'usd' },
    ])
  })

  it('maps tiered pricing (number values) using the default tier price', () => {
    const result = mapBoothConfig({
      pricing: { '/api/joke': { default: 5, standard: 21, premium: 42 } },
    }, baseOptions)
    expect(result.pricing).toEqual([
      { capability: '/api/joke', price: 5, currency: 'sats' },
    ])
  })

  it('maps tiered pricing without default tier using the lowest number value', () => {
    const result = mapBoothConfig({
      pricing: { '/api/joke': { standard: 21, premium: 42 } },
    }, baseOptions)
    expect(result.pricing).toEqual([
      { capability: '/api/joke', price: 21, currency: 'sats' },
    ])
  })

  it('maps tiered pricing with PriceInfo values using default tier sats', () => {
    const result = mapBoothConfig({
      pricing: { '/api/joke': { default: { sats: 5, usd: 2 }, premium: { sats: 42, usd: 10 } } },
    }, baseOptions)
    expect(result.pricing).toEqual([
      { capability: '/api/joke', price: 5, currency: 'sats' },
    ])
  })

  it('passes through user-provided fields', () => {
    const opts: TollBoothAnnounceOptions = {
      ...baseOptions,
      picture: 'https://example.com/icon.png',
      topics: ['routing', 'maps'],
      version: '1.0.0',
    }
    const result = mapBoothConfig({ pricing: { '/test': 10 } }, opts)
    expect(result.picture).toBe('https://example.com/icon.png')
    expect(result.topics).toEqual(['routing', 'maps'])
    expect(result.version).toBe('1.0.0')
  })

  it('passes through secretKey, relays, urls, about, paymentMethods', () => {
    const result = mapBoothConfig({ pricing: { '/test': 10 } }, baseOptions)
    expect(result.secretKey).toBe('a'.repeat(64))
    expect(result.relays).toEqual(['wss://relay.example.com'])
    expect(result.urls).toEqual(['https://example.com'])
    expect(result.about).toBe('Test service')
    expect(result.paymentMethods).toEqual(['bitcoin-lightning-bolt11'])
  })
})

describe('payment method auto-derivation', () => {
  it('includes bitcoin-cashu-xcashu when xcashu is configured', () => {
    const result = mapBoothConfig(
      { pricing: { '/api': 10 }, xcashu: { mints: ['https://mint.example.com'] } },
      { secretKey: 'a'.repeat(64), relays: ['wss://r.example.com'], urls: ['https://api.example.com'], about: 'test' },
    )
    expect(result.paymentMethods).toContain('bitcoin-cashu-xcashu')
  })

  it('includes bitcoin-lightning-bolt11 when backend is present', () => {
    const result = mapBoothConfig(
      { pricing: { '/api': 10 }, hasBackend: true },
      { secretKey: 'a'.repeat(64), relays: ['wss://r.example.com'], urls: ['https://api.example.com'], about: 'test' },
    )
    expect(result.paymentMethods).toContain('bitcoin-lightning-bolt11')
  })

  it('user-provided paymentMethods override auto-derived', () => {
    const result = mapBoothConfig(
      { pricing: { '/api': 10 }, xcashu: { mints: ['https://mint.example.com'] } },
      { secretKey: 'a'.repeat(64), relays: ['wss://r.example.com'], urls: ['https://api.example.com'], about: 'test', paymentMethods: ['custom-method'] },
    )
    expect(result.paymentMethods).toEqual(['custom-method'])
  })

  it('combines Lightning and xcashu when both present', () => {
    const result = mapBoothConfig(
      { pricing: { '/api': 10 }, hasBackend: true, xcashu: { mints: ['https://mint.example.com'] } },
      { secretKey: 'a'.repeat(64), relays: ['wss://r.example.com'], urls: ['https://api.example.com'], about: 'test' },
    )
    expect(result.paymentMethods).toContain('bitcoin-lightning-bolt11')
    expect(result.paymentMethods).toContain('bitcoin-cashu-xcashu')
  })

  it('returns empty paymentMethods when no backend or xcashu and none provided', () => {
    const result = mapBoothConfig(
      { pricing: { '/api': 10 } },
      { secretKey: 'a'.repeat(64), relays: ['wss://r.example.com'], urls: ['https://api.example.com'], about: 'test' },
    )
    expect(result.paymentMethods).toEqual([])
  })
})
