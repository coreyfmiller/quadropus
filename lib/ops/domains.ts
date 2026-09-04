/**
 * Domain availability checking for the Idea Lab.
 *
 * Preferred TLDs: .com and .ai.
 *
 * Method by TLD:
 * - .com: RDAP (https://rdap.org bootstraps to Verisign). Authoritative: a 404 means
 *   the domain is unregistered (available); a 200 means registered (taken).
 * - .ai: Anguilla has NO public RDAP server, so we fall back to a DNS resolution check.
 *   This is a SIGNAL, not authoritative (a registered .ai can have no DNS). We mark
 *   .ai results as confidence 'likely' so the UI can be honest about it.
 *
 * Structured so a Porkbun availability/pricing API + register deep-links can be added later.
 */

export type DomainStatus = 'available' | 'taken' | 'unknown'
export type Confidence = 'confirmed' | 'likely'

export interface DomainResult {
  domain: string
  tld: string
  status: DomainStatus
  confidence: Confidence
  method: 'rdap' | 'dns'
  registerUrl: string | null
}

const TIMEOUT_MS = 9000
const MAX_RETRIES = 3 // retry transient failures so throttling never looks like "unavailable"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Porkbun checkout deep-link for a domain search (you register there). */
function porkbunSearchUrl(domain: string): string {
  return `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`
}

// RDAP endpoints by TLD. Verisign serves .com/.net directly and reliably.
// A User-Agent header is required; without it rdap.org returns 403.
function rdapEndpoint(domain: string, tld: string): string {
  if (tld === 'com') return `https://rdap.verisign.com/com/v1/domain/${domain}`
  if (tld === 'net') return `https://rdap.verisign.com/net/v1/domain/${domain}`
  return `https://rdap.org/domain/${domain}`
}

/**
 * Authoritative check via RDAP: 404 = available, 200 = taken.
 * Retries transient failures (429/5xx/network) with backoff, so throttling is NEVER
 * mistaken for "unavailable". Returns 'unknown' only after all retries are exhausted.
 */
async function checkRdap(domain: string): Promise<DomainResult> {
  const tld = domain.split('.').pop() || ''
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(rdapEndpoint(domain, tld), {
        headers: { Accept: 'application/rdap+json', 'User-Agent': 'QuadropusIdeaLab/1.0' },
      })
      if (res.status === 404) {
        return { domain, tld, status: 'available', confidence: 'confirmed', method: 'rdap', registerUrl: porkbunSearchUrl(domain) }
      }
      if (res.status === 200) {
        return { domain, tld, status: 'taken', confidence: 'confirmed', method: 'rdap', registerUrl: null }
      }
      // 429/5xx = throttled/transient -> back off and retry.
      if (res.status === 429 || res.status >= 500) {
        await sleep(1200 * (attempt + 1))
        continue
      }
      // Any other definitive status: unknown, don't loop forever.
      return { domain, tld, status: 'unknown', confidence: 'likely', method: 'rdap', registerUrl: porkbunSearchUrl(domain) }
    } catch {
      await sleep(1200 * (attempt + 1)) // network/timeout -> back off and retry
    }
  }
  // Exhausted retries: honestly unknown (NOT treated as unavailable upstream).
  return { domain, tld, status: 'unknown', confidence: 'likely', method: 'rdap', registerUrl: porkbunSearchUrl(domain) }
}

/**
 * Best-effort .ai check via DNS (no NS records suggests it may be unregistered).
 * Retries transient failures so throttling is not mistaken for a definitive answer.
 */
async function checkDns(domain: string): Promise<DomainResult> {
  const tld = domain.split('.').pop() || ''
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`)
      if (res.status === 429 || res.status >= 500) {
        await sleep(1200 * (attempt + 1))
        continue
      }
      const data = await res.json()
      if (data.Status === 3) {
        return { domain, tld, status: 'available', confidence: 'likely', method: 'dns', registerUrl: porkbunSearchUrl(domain) }
      }
      if (Array.isArray(data.Answer) && data.Answer.length > 0) {
        return { domain, tld, status: 'taken', confidence: 'likely', method: 'dns', registerUrl: null }
      }
      return { domain, tld, status: 'unknown', confidence: 'likely', method: 'dns', registerUrl: porkbunSearchUrl(domain) }
    } catch {
      await sleep(1200 * (attempt + 1))
    }
  }
  return { domain, tld, status: 'unknown', confidence: 'likely', method: 'dns', registerUrl: porkbunSearchUrl(domain) }
}

// Only .com/.net have a reliable authoritative RDAP (Verisign). For everything else
// (.ai/.io/.co/.ca), rdap.org's bootstrap is unreliable. It returned false 404s for
// registered .io/.co domains in testing, so we use a DNS signal (labeled 'likely')
// instead of a wrong "confirmed". A wrong "confirmed available" is worse than an honest guess.
const RDAP_AUTHORITATIVE_TLDS = new Set(['com', 'net'])

export async function checkDomain(domain: string): Promise<DomainResult> {
  const clean = domain.trim().toLowerCase()
  const tld = clean.split('.').pop() || ''
  if (RDAP_AUTHORITATIVE_TLDS.has(tld)) return checkRdap(clean)
  return checkDns(clean)
}

/**
 * Check many domains ACCURATELY. Prioritizes correctness over speed: runs with low
 * concurrency and a small delay between waves so we never burst-hit RDAP/DNS and get
 * throttled (throttling is what was making available names look unavailable).
 */
export async function checkDomains(domains: string[]): Promise<DomainResult[]> {
  const unique = Array.from(new Set(domains.map((d) => d.trim().toLowerCase()).filter(Boolean)))
  const CONCURRENCY = 4
  const WAVE_DELAY_MS = 400
  const out: DomainResult[] = []
  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const wave = unique.slice(i, i + CONCURRENCY)
    const settled = await Promise.all(wave.map(checkDomain))
    out.push(...settled)
    if (i + CONCURRENCY < unique.length) await sleep(WAVE_DELAY_MS)
  }
  return out
}

/** The TLDs the Brand Lab can check. .com/.ai are the defaults. */
export const SELECTABLE_TLDS = ['com', 'ai', 'io', 'co', 'ca'] as const
export const DEFAULT_TLDS = ['com', 'ai']

/** Build domain candidates from a base brand name for the given TLDs (defaults to .com/.ai). */
export function candidatesFor(name: string, tlds: string[] = DEFAULT_TLDS): string[] {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!base) return []
  const valid = tlds.filter((t) => (SELECTABLE_TLDS as readonly string[]).includes(t))
  const use = valid.length ? valid : DEFAULT_TLDS
  return use.map((t) => `${base}.${t}`)
}
