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

const TIMEOUT_MS = 7000

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

/** Authoritative check via RDAP: 404 = available, 200 = taken. */
async function checkRdap(domain: string): Promise<DomainResult> {
  const tld = domain.split('.').pop() || ''
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
    return { domain, tld, status: 'unknown', confidence: 'likely', method: 'rdap', registerUrl: porkbunSearchUrl(domain) }
  } catch {
    return { domain, tld, status: 'unknown', confidence: 'likely', method: 'rdap', registerUrl: porkbunSearchUrl(domain) }
  }
}

/** Best-effort .ai check via DNS: no A/NS records resolving suggests it may be available. */
async function checkDns(domain: string): Promise<DomainResult> {
  const tld = domain.split('.').pop() || ''
  try {
    // Use Google's DNS-over-HTTPS to look for NS records (registered domains have NS).
    const res = await fetchWithTimeout(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`
    )
    const data = await res.json()
    // Status 3 (NXDOMAIN) => not registered. Answer with NS => registered.
    if (data.Status === 3) {
      return { domain, tld, status: 'available', confidence: 'likely', method: 'dns', registerUrl: porkbunSearchUrl(domain) }
    }
    if (Array.isArray(data.Answer) && data.Answer.length > 0) {
      return { domain, tld, status: 'taken', confidence: 'likely', method: 'dns', registerUrl: null }
    }
    return { domain, tld, status: 'unknown', confidence: 'likely', method: 'dns', registerUrl: porkbunSearchUrl(domain) }
  } catch {
    return { domain, tld, status: 'unknown', confidence: 'likely', method: 'dns', registerUrl: porkbunSearchUrl(domain) }
  }
}

export async function checkDomain(domain: string): Promise<DomainResult> {
  const clean = domain.trim().toLowerCase()
  const tld = clean.split('.').pop() || ''
  // .com (and other gTLDs with RDAP) => authoritative RDAP. .ai => DNS fallback.
  if (tld === 'ai') return checkDns(clean)
  return checkRdap(clean)
}

export async function checkDomains(domains: string[]): Promise<DomainResult[]> {
  const unique = Array.from(new Set(domains.map((d) => d.trim().toLowerCase()).filter(Boolean)))
  return Promise.all(unique.map(checkDomain))
}

/** Build .com and .ai candidates from a base brand name (strips spaces/punctuation). */
export function candidatesFor(name: string): string[] {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!base) return []
  return [`${base}.com`, `${base}.ai`]
}
