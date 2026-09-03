/**
 * Idea Lab engine. Gemini acts as a brand strategist: it generates business/product
 * ideas with distinctive names (in a chosen style) and a short branding rationale.
 * We then check .com/.ai availability and keep ONLY ideas that have an available domain,
 * over-generating across rounds until we hit the target count.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { candidatesFor, checkDomains, type DomainResult } from './domains'
import { checkTrademark, type TrademarkCheck } from './trademark'

export type NameStyle = 'evocative' | 'coined' | 'compound' | 'playful' | 'literal'
export type Perspective = 'customer' | 'buyer' | 'both'

export interface IdeaResult {
  idea: string // the underlying business/product idea (one line)
  name: string // the chosen brand name
  tagline: string // short positioning line, e.g. "Your next role. Found."
  why: string // marketing rationale: why this name works
  audience: string
  available: DomainResult[] // only the AVAILABLE domains for this name (.com confirmed / .ai likely)
  trademark: TrademarkCheck // PRELIMINARY signal + links to official searches (not legal clearance)
}

const STYLE_GUIDANCE: Record<NameStyle, string> = {
  evocative:
    'Evocative real words that carry feeling or imagery (e.g. Ember, Thicket, Lantern, Harbor). Emotional resonance over literal meaning.',
  coined:
    'Freshly invented words that sound real and pronounceable, but AVOID the tired startup patterns (-ify, -ly, -ora, -ixa, vox-, -match, -ai suffixes). Think Zenved, Marlo, Kessik.',
  compound:
    'Two real words joined naturally (e.g. NorthKiln, PaperTrail, OpenHarbor, RiverKeep). Must read smoothly, not mashed nonsense.',
  playful:
    'Playful, metaphor-driven, unexpected names that make you smile and are memorable (e.g. Batch, Pigeon, Anvil used cleverly).',
  literal:
    'Clear, descriptive names a customer instantly understands, made distinctive with an unexpected but real word.',
}

const PERSPECTIVE_GUIDANCE: Record<Perspective, string> = {
  customer:
    'The END USER / customer is the hero. The name should feel welcoming and aspirational to the person USING the product (e.g. for a job site, the job seeker: "find your next role"), not to the business buying it.',
  buyer:
    'The BUYER / business is the hero. The name should sound credible, premium, and results-oriented to the company purchasing this (e.g. for a job site, the employer/recruiter).',
  both:
    'The name must work for BOTH sides of the marketplace, with a positioning line that flips cleanly (e.g. "Your next hire. Found." / "Your next role. Found.").',
}

function buildSystem(styles: NameStyle[], perspective: Perspective): string {
  const styleText =
    styles.length > 0
      ? `Use these naming styles (mix across your suggestions):\n${styles
          .map((s) => `- ${s.toUpperCase()}: ${STYLE_GUIDANCE[s]}`)
          .join('\n')}`
      : `Use a mix: strong single real words (Vetted, Found, Merit, Beacon), fresh coined words that sound like a real company, and natural two-word compounds (RoleCall, FirstRound, NextRole). Avoid tired startup patterns (-ify, -ly, -ora, -ixa, vox-, -match).`

  return `You are a world-class brand strategist who names venture-backed startups for a living (the caliber of Vetted, Handshake, Ramp, Found). You know which names feel like a $100M company versus a cheap AI feature.

Your job: given a business space, propose brand names a founder would be PROUD to own, each with a sharp positioning tagline, that are likely to still have an available domain.

WHO IS THE HERO: ${PERSPECTIVE_GUIDANCE[perspective]}

${styleText}

What great names in this tier look like:
- Real evocative words used confidently (Vetted, Found, Merit, Proof, Beacon, Roster, Stride).
- Clever two-word compounds tied to the domain (RoleCall, FirstRound, NextRole, ProofPoint).
- Coined words that sound like an established company, not a generator (Ramp, Brex, Lattice).

Hard rules:
- Letters only, lowercase-safe, no spaces, no hyphens, no numbers.
- Easy to say and spell after hearing once.
- AVOID names that collide with well-known companies in this space. If the space is jobs/recruiting, do NOT use Indeed, Monster, ZipRecruiter, Handshake, Greenhouse, Lever, Wellfound. Same idea for any space: never suggest an existing major brand.
- Ruthlessly cut anything generic or that sounds like every other AI startup.

For EACH suggestion return:
- idea: one sentence describing the specific product/business (tie it to the space).
- name: the brand name.
- tagline: a short, punchy positioning line (3 to 6 words), like "Your next role. Found." or "Meet candidates worth meeting."
- why: one sentence on WHY this name works from a branding standpoint.
- audience: who it is for, in a few words.

Return MANY varied, high-quality suggestions. NEVER use em dashes anywhere; use commas or periods.
Return ONLY valid JSON, no markdown fences, in this exact shape:
{"suggestions":[{"idea":"...","name":"...","tagline":"...","why":"...","audience":"..."}]}`
}

interface RawSuggestion {
  idea?: string
  name?: string
  tagline?: string
  why?: string
  audience?: string
}

function extractJsonSuggestions(text: string): { suggestions?: RawSuggestion[] } {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try { return JSON.parse(match[0]) } catch { /* fall through */ }
    }
    return {}
  }
}

function getApiKey(): string {
  const rawKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
  const apiKey = rawKey.split(/\s+/).find((s) => s.trim().length > 0)?.trim() || ''
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not set')
  return apiKey
}

/** One round: ask the model for a batch of named suggestions. */
async function generateBatch(
  niche: string,
  styles: NameStyle[],
  perspective: Perspective,
  batchSize: number,
  avoid: string[]
): Promise<RawSuggestion[]> {
  const google = createGoogleGenerativeAI({ apiKey: getApiKey() })
  const space = niche.trim() || 'diverse products a solo technical founder could build'
  const avoidText = avoid.length
    ? `\n\nDo NOT reuse any of these names already suggested: ${avoid.slice(-60).join(', ')}.`
    : ''
  const { text } = await generateText({
    model: google('gemini-flash-latest'),
    system: buildSystem(styles, perspective),
    prompt: `Propose ${batchSize} distinct, premium brand names for products in this space: ${space}.${avoidText}`,
    temperature: 0.9,
  })
  const parsed = extractJsonSuggestions(text)
  return Array.isArray(parsed.suggestions) ? parsed.suggestions : []
}

export interface FindOptions {
  niche: string
  styles: NameStyle[]
  perspective?: Perspective
  target: number // how many AVAILABLE ideas to find
  maxRounds?: number
  batchSize?: number // names generated per round (smaller = lighter requests)
  onProgress?: (info: { checked: number; found: number; round: number }) => void
}

/**
 * Over-generate and filter: keep asking for names, check .com/.ai availability,
 * and collect only the ones with an available domain until we hit `target`.
 */
export async function findAvailableIdeas(opts: FindOptions): Promise<IdeaResult[]> {
  const { niche, styles, target } = opts
  const perspective = opts.perspective ?? 'both'
  // Keep trying more rounds to hit the target (bounded by the route's time budget).
  const maxRounds = opts.maxRounds ?? 12
  const batchSize = opts.batchSize ?? 8 // smaller default = lighter, more Vercel-friendly requests

  const results: IdeaResult[] = []
  const seenNames = new Set<string>()
  let checked = 0

  const t0 = Date.now()
  const elapsed = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`
  console.log(`[ideas] START target=${target} maxRounds=${maxRounds} styles=[${styles.join(',')}] perspective=${perspective}`)

  for (let round = 1; round <= maxRounds && results.length < target; round++) {
    const rt = Date.now()
    const genStart = Date.now()
    const batch = await generateBatch(niche, styles, perspective, batchSize, [...seenNames])
    const genMs = Date.now() - genStart

    // Normalize + de-dupe by name.
    const fresh = batch
      .filter((s) => s && typeof s.name === 'string' && s.name.trim())
      .map((s) => ({
        idea: (s.idea || '').trim(),
        name: (s.name || '').trim(),
        tagline: (s.tagline || '').trim(),
        why: (s.why || '').trim(),
        audience: (s.audience || '').trim(),
      }))
      .filter((s) => {
        const key = s.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!key || seenNames.has(key)) return false
        seenNames.add(key)
        return true
      })

    if (fresh.length === 0) {
      console.log(`[ideas] round ${round}: gen ${genMs}ms -> 0 fresh names (all dupes), skipping`)
      continue
    }

    // Check all candidate domains for this batch (throttled for accuracy).
    const allDomains = fresh.flatMap((s) => candidatesFor(s.name))
    const chkStart = Date.now()
    const domainResults = await checkDomains(allDomains)
    const chkMs = Date.now() - chkStart
    checked += domainResults.length
    const byDomain = new Map(domainResults.map((r) => [r.domain, r]))

    const availCount = domainResults.filter((r) => r.status === 'available').length
    const unknownCount = domainResults.filter((r) => r.status === 'unknown').length
    const foundBefore = results.length

    for (const s of fresh) {
      if (results.length >= target) break
      const candidates = candidatesFor(s.name)
      const available = candidates
        .map((d) => byDomain.get(d))
        .filter((r): r is DomainResult => !!r && r.status === 'available')
      if (available.length > 0) {
        results.push({
          idea: s.idea,
          name: s.name,
          tagline: s.tagline,
          why: s.why,
          audience: s.audience,
          available,
          trademark: checkTrademark(s.name),
        })
      }
    }

    console.log(
      `[ideas] round ${round}: gen ${genMs}ms, ${fresh.length} names, ` +
        `checked ${domainResults.length} domains in ${chkMs}ms ` +
        `(avail ${availCount}, unknown ${unknownCount}), ` +
        `found +${results.length - foundBefore} (total ${results.length}/${target}), ` +
        `round ${Date.now() - rt}ms, elapsed ${elapsed()}`
    )

    opts.onProgress?.({ checked, found: results.length, round })
  }

  console.log(`[ideas] DONE ${results.length}/${target} in ${elapsed()}, ${checked} domains checked total`)
  return results.slice(0, target)
}
