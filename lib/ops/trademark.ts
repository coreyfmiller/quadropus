/**
 * Trademark signal for the Idea Lab.
 *
 * IMPORTANT: This is a PRELIMINARY signal, NOT legal clearance. There is no free,
 * reliable USPTO keyword-search API, so we do two honest things:
 *   1. A lightweight heuristic that flags names containing/matching well-known brands.
 *   2. Provide one-click deep-links to the authoritative searches (USPTO + CIPO Canada)
 *      pre-filled with the name, so the user can verify in one click.
 *
 * A domain being available does NOT mean the name is trademark-clear. Always verify
 * via the linked official searches (and a lawyer for anything real) before registering.
 */

export type TrademarkFlag = 'clear-signal' | 'caution'

export interface TrademarkCheck {
  flag: TrademarkFlag
  reason: string
  usptoUrl: string // authoritative US search, pre-filled
  cipoUrl: string // authoritative Canada search
}

// Well-known brands/terms that, if a coined name embeds them, warrant a caution.
// Not exhaustive; a heuristic to catch obvious collisions cheaply.
const KNOWN_BRANDS = [
  'google', 'apple', 'amazon', 'meta', 'facebook', 'insta', 'microsoft', 'netflix',
  'spotify', 'uber', 'airbnb', 'stripe', 'shopify', 'tesla', 'nike', 'adidas', 'disney',
  'openai', 'anthropic', 'nvidia', 'oracle', 'adobe', 'slack', 'notion', 'figma', 'canva',
  'linkedin', 'indeed', 'monster', 'ziprecruiter', 'handshake', 'greenhouse', 'workday',
  'salesforce', 'hubspot', 'paypal', 'venmo', 'coinbase', 'ramp', 'brex', 'lattice',
]

export function checkTrademark(name: string): TrademarkCheck {
  const clean = name.trim()
  const lower = clean.toLowerCase()

  const hit = KNOWN_BRANDS.find((b) => lower.includes(b))
  const flag: TrademarkFlag = hit ? 'caution' : 'clear-signal'
  const reason = hit
    ? `Contains "${hit}", which resembles a well-known brand. Verify carefully before use.`
    : 'No obvious well-known-brand collision. Still verify against the official databases.'

  return {
    flag,
    reason,
    // USPTO public trademark search (TESS successor). Pre-fills the query.
    usptoUrl: `https://tmsearch.uspto.gov/search/search-information?query=${encodeURIComponent(clean)}`,
    // CIPO Canadian Trademarks Database search.
    cipoUrl: `https://ised-isde.canada.ca/cipo/trademark-search/srch?null&text=${encodeURIComponent(clean)}`,
  }
}
