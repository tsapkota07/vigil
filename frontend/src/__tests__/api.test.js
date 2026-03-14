/**
 * Unit tests for src/api.js
 * Verifies that each function calls the correct backend endpoint
 * with the right method, headers, and body. No real network calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runAudit, getHistory, getRecentAudits, createSchedule } from '../api'

// ─── helpers ────────────────────────────────────────────────────────────────

function mockFetch(body, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

// ─── runAudit ────────────────────────────────────────────────────────────────

describe('runAudit', () => {
  it('POSTs to /audit with the URL in the body', async () => {
    const fakeResult = { url: 'https://example.com', scores: { overall: 80 } }
    global.fetch = mockFetch(fakeResult)

    const result = await runAudit('https://example.com')

    expect(fetch).toHaveBeenCalledOnce()
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toMatch(/\/audit$/)
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(opts.body)).toEqual({ url: 'https://example.com' })
    expect(result).toEqual(fakeResult)
  })

  it('throws with the backend error message on non-2xx response', async () => {
    global.fetch = mockFetch({ detail: 'Could not fetch the page' }, 400)

    await expect(runAudit('https://bad.invalid')).rejects.toThrow('Could not fetch the page')
  })

  it('throws a fallback message when error body has no detail field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('not json') },
    })

    await expect(runAudit('https://bad.invalid')).rejects.toThrow('Internal Server Error')
  })
})

// ─── getHistory ──────────────────────────────────────────────────────────────

describe('getHistory', () => {
  it('GETs /history with the URL and limit as query params', async () => {
    const fakeHistory = [{ id: 1, scores: { overall: 75 }, created_at: '2026-03-14T00:00:00' }]
    global.fetch = mockFetch(fakeHistory)

    const result = await getHistory('https://example.com', 10)

    expect(fetch).toHaveBeenCalledOnce()
    const [url] = fetch.mock.calls[0]
    expect(url).toMatch(/\/history/)
    expect(url).toContain('url=https%3A%2F%2Fexample.com')
    expect(url).toContain('limit=10')
    expect(result).toEqual(fakeHistory)
  })

  it('uses default limit of 20 when not specified', async () => {
    global.fetch = mockFetch([])

    await getHistory('https://example.com')

    const [url] = fetch.mock.calls[0]
    expect(url).toContain('limit=20')
  })

  it('throws on non-2xx response', async () => {
    global.fetch = mockFetch({ detail: 'Not found' }, 404)

    await expect(getHistory('https://new.com')).rejects.toThrow('No history found')
  })
})

// ─── getRecentAudits ─────────────────────────────────────────────────────────

describe('getRecentAudits', () => {
  it('GETs /audits/recent with the limit param', async () => {
    const fakeAudits = [
      { id: 1, url: 'https://example.com', scores: { overall: 80 }, created_at: '2026-03-14T00:00:00' },
      { id: 2, url: 'https://other.com',   scores: { overall: 65 }, created_at: '2026-03-13T00:00:00' },
    ]
    global.fetch = mockFetch(fakeAudits)

    const result = await getRecentAudits(10)

    expect(fetch).toHaveBeenCalledOnce()
    const [url] = fetch.mock.calls[0]
    expect(url).toMatch(/\/audits\/recent/)
    expect(url).toContain('limit=10')
    expect(result).toEqual(fakeAudits)
  })

  it('defaults to limit 30 when not specified', async () => {
    global.fetch = mockFetch([])

    await getRecentAudits()

    const [url] = fetch.mock.calls[0]
    expect(url).toContain('limit=30')
  })

  it('throws on non-2xx response', async () => {
    global.fetch = mockFetch({}, 500)

    await expect(getRecentAudits()).rejects.toThrow('Could not load recent audits')
  })
})

// ─── createSchedule ──────────────────────────────────────────────────────────

describe('createSchedule', () => {
  it('POSTs to /schedule with all required fields', async () => {
    const fakeResponse = { schedule_id: 1, message: 'Scheduled' }
    global.fetch = mockFetch(fakeResponse)

    const payload = {
      url: 'https://example.com',
      interval_hours: 6,
      alert_email: 'user@test.com',
      alert_threshold: 70,
    }
    const result = await createSchedule(payload)

    expect(fetch).toHaveBeenCalledOnce()
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toMatch(/\/schedule$/)
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')

    const body = JSON.parse(opts.body)
    expect(body.url).toBe('https://example.com')
    expect(body.interval_hours).toBe(6)
    expect(body.alert_email).toBe('user@test.com')
    expect(body.alert_threshold).toBe(70)
    expect(result).toEqual(fakeResponse)
  })

  it('sends null for alert_email when omitted', async () => {
    global.fetch = mockFetch({ schedule_id: 2 })

    await createSchedule({
      url: 'https://example.com',
      interval_hours: 24,
      alert_email: null,
      alert_threshold: 70,
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.alert_email).toBeNull()
  })

  it('throws on non-2xx response', async () => {
    global.fetch = mockFetch({ detail: 'Bad request' }, 400)

    await expect(createSchedule({
      url: 'https://example.com',
      interval_hours: 6,
      alert_email: null,
      alert_threshold: 70,
    })).rejects.toThrow('Failed to save schedule')
  })
})
