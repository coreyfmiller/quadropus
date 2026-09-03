/**
 * Porkbun domain availability (authoritative confirm, Stage 2).
 *
 * IMPORTANT: Porkbun's checkDomain endpoint is rate-limited to ~1 request / 10 seconds.
 * So this is NOT a bulk checker. It's used to CONFIRM a single domain on demand (e.g. a
 * "Verify" button), after the cheap RDAP/DNS pre-filter (Stage 1) has narrowed candidates.
 *
 * Env: PORKBUN_API_KEY (pk1_...), PORKBUN_SECRET_KEY (sk1_...).
 */

export interface PorkbunResult {
  domain: string
  available: boolean | null // true/false authoritative; null if unknown/error
  price: string | null // registration price if available
  premium: boolean
  error: string | null
  rateLimited: boolean
}

export async function porkbunCheck(domain: string): Promise<PorkbunResult> {
  const apikey = process.env.PORKBUN_API_KEY
  const secretapikey = process.env.PORKBUN_SECRET_KEY
  const base: PorkbunResult = {
    domain,
    available: null,
    price: null,
    premium: false,
    error: null,
    rateLimited: false,
  }

  if (!apikey || !secretapikey) {
    return { ...base, error: 'Porkbun API keys not configured' }
  }

  try {
    const res = await fetch(`https://api.porkbun.com/api/json/v3/domain/checkDomain/${encodeURIComponent(domain)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey, secretapikey }),
      signal: AbortSignal.timeout(12000),
    })
    const data = await res.json()

    if (res.status === 429 || data?.code === 'RATE_LIMIT_EXCEEDED') {
      return { ...base, rateLimited: true, error: 'Porkbun rate limit, try again in a few seconds' }
    }
    if (data?.status !== 'SUCCESS' || !data?.response) {
      return { ...base, error: data?.message || 'Porkbun check failed' }
    }

    const r = data.response
    return {
      domain,
      available: r.avail === 'yes',
      price: r.price ?? null,
      premium: r.premium === 'yes',
      error: null,
      rateLimited: false,
    }
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : 'Porkbun request failed' }
  }
}
