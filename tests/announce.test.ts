import { describe, it, expect, vi } from 'vitest'

// Mock 402-announce before importing
vi.mock('402-announce', () => ({
  announceService: vi.fn().mockResolvedValue({
    eventId: 'abc123',
    pubkey: 'def456',
    close: vi.fn(),
  }),
}))

import { announce } from '../src/announce.js'
import { announceService } from '402-announce'

const boothConfig = {
  serviceName: 'Valhalla Routing',
  pricing: { '/route': 2, '/isochrone': 5 },
}

const options = {
  secretKey: 'a'.repeat(64),
  relays: ['wss://relay.damus.io'],
  urls: ['https://routing.trotters.cc'],
  about: 'Production routing engine',
  paymentMethods: [['l402', 'lightning']],
  topics: ['routing', 'maps'],
}

describe('announce', () => {
  it('calls announceService with mapped config', async () => {
    await announce(boothConfig, options)

    expect(announceService).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Valhalla Routing',
        identifier: 'valhalla-routing',
        urls: ['https://routing.trotters.cc'],
        about: 'Production routing engine',
        paymentMethods: [['l402', 'lightning']],
        topics: ['routing', 'maps'],
        pricing: [
          { capability: '/route', price: 2, currency: 'sats' },
          { capability: '/isochrone', price: 5, currency: 'sats' },
        ],
      }),
    )
  })

  it('returns the Announcement from announceService', async () => {
    const result = await announce(boothConfig, options)
    expect(result.eventId).toBe('abc123')
    expect(result.pubkey).toBe('def456')
    expect(typeof result.close).toBe('function')
  })

  it('passes secretKey and relays through', async () => {
    await announce(boothConfig, options)

    expect(announceService).toHaveBeenCalledWith(
      expect.objectContaining({
        secretKey: 'a'.repeat(64),
        relays: ['wss://relay.damus.io'],
      }),
    )
  })
})
