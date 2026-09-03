/**
 * Idea Lab engine. Gemini acts as a brand strategist: it generates business/product
 * ideas with distinctive names (in a chosen style) and a short branding rationale.
 * We then check .com/.ai availability and keep ONLY ideas that have an available domain,
 * over-generating across rounds until we hit the target count.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { candidatesFor, checkDomains, type DomainResult } from './domains'

export type NameStyle = 'evocative' | 'coined' | 'compound' | 'playful' | 'literal'

export interface IdeaResult {
  idea: string // the underlying business/product idea (one line)
  name: string // the chosen brand name
  why: string // marketing rationale: why this name works
  audience: string
  available: DomainResult[] // only the AVAILABLE domains for this name (.com confirmed / .ai likely)
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

function buildSystem(styles: NameStyle[]): string {
  const styleText =
    styles.length > 0
      ? `Use these naming styles (mix across your suggestions):\n${styles
          .map((s) => `- ${s.toUpperCase()}: ${STYLE_GUIDANCE[s]}`)
          .join('\n')}`
      : `Use a mix of evocative real words, fresh coined words, and natural two-word compounds. Avoid tired startup patterns (-ify, -ly, -ora, -ixa, vox-, -match).`

  return `You are a world-class brand strategist and naming expert. You name companies and products for a living, and you know which names feel premium, memorable, and ownable.

Your job: given a business idea space, propose distinctive brand names that a founder would be PROUD to own, and that are likely to still have an available domain.

${styleText}

Hard rules for names:
- Letters only, lowercase-safe, no spaces, no hyphens, no numbers.
- 5 to 18 characters. Longer, more distinctive names are far more likely to have a free domain than short obvious ones.
- Easy to say out loud and spell after hearing it once.
- Deliberately AVOID generic, picked-over names. If it sounds like every other AI startup, discard it.
- No trademarks or famous brand names.

For EACH suggestion return:
- idea: one sentence describing the specific product/business (tie it to the space given).
- name: the brand name.
- why: one punchy sentence on WHY this name works from a branding standpoint (the strategist's rationale).
- audience: who it is for, in a few words.

Return MANY varied suggestions. NEVER use em dashes anywhere; use commas or periods.
Return ONLY valid JSON, no markdown fences, in this exact shape:
{"suggestions":[{"idea":"...","name":"...","why":"...","audience":"..."}]}`
}

interface RawSuggestion {
  idea?: string
  name?: string
  why?: string
  audience?: string
}

function extractJson(text: string): { suggestions?: RawSuggestion[] } {
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
async function generateBatch(niche: string, styles: NameStyle[], batchSize: number, avoid: string[]): Promise<RawSuggestion[]> {
  const google = createGoogleGenerativeAI({ apiKey: getApiKey() })
  const space = niche.trim() || 'diverse products a solo technical founder could build'
  const avoidText = avoid.length
    ? `\n\nDo NOT reuse any of these names already suggested: ${avoid.slice(-60).join(', ')}.`
    : ''
  const { text } = await generateText({
    model: google('gemini-flash-latest'),
    system: buildSystem(styles),
    prompt: `Propose ${batchSize} distinct brand names for products in this space: ${space}.${avoidText}`,
    temperature: 0.9,
  })
  const parsed = extractJson(text)
  return Array.isArray(parsed.suggestions) ? parsed.suggestions : []
}

export interface FindOptions {
  niche: string
  styles: NameStyle[]
  target: number // how many AVAILABLE ideas to find
  maxRounds?: number
  onProgress?: (info: { checked: number; found: number; round: number }) => void
}

/**
 * Over-generate and filter: keep asking for names, check .com/.ai availability,
 * and collect only the ones with an available domain until we hit `target`.
 */
export async function findAvailableIdeas(opts: FindOptions): Promise<IdeaResult[]> {
  const { niche, styles, target } = opts
  const maxRounds = opts.maxRounds ?? 6
  const batchSize = 12

  const results: IdeaResult[] = []
  const seenNames = new Set<string>()
  let checked = 0

  for (let round = 1; round <= maxRounds && results.length < target; round++) {
    const batch = await generateBatch(niche, styles, batchSize, [...seenNames])

    // Normalize + de-dupe by name.
    const fresh = batch
      .filter((s) => s && typeof s.name === 'string' && s.name.trim())
      .map((s) => ({
        idea: (s.idea || '').trim(),
        name: (s.name || '').trim(),
        why: (s.why || '').trim(),
        audience: (s.audience || '').trim(),
      }))
      .filter((s) => {
        const key = s.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!key || seenNames.has(key)) return false
        seenNames.add(key)
        return true
      })

    if (fresh.length === 0) continue

    // Check all candidate domains for this batch in one shot.
    const allDomains = fresh.flatMap((s) => candidatesFor(s.name))
    const domainResults = await checkDomains(allDomains)
    checked += domainResults.length
    const byDomain = new Map(domainResults.map((r) => [r.domain, r]))

    for (const s of fresh) {
      if (results.length >= target) break
      const candidates = candidatesFor(s.name)
      const available = candidates
        .map((d) => byDomain.get(d))
        .filter((r): r is DomainResult => !!r && r.status === 'available')
      if (available.length > 0) {
        results.push({ idea: s.idea, name: s.name, why: s.why, audience: s.audience, available })
      }
    }

    opts.onProgress?.({ checked, found: results.length, round })
  }

  return results.slice(0, target)
}
