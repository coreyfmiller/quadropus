/**
 * Idea generation for the Idea Lab. Gemini generates brandable business/product ideas
 * with a name, one-line pitch, and target audience. Domain candidates (.com/.ai) are
 * derived from the name and checked separately by lib/ops/domains.ts.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { candidatesFor } from './domains'

export interface Idea {
  name: string
  pitch: string
  audience: string
  domains: string[] // candidate domains (.com, .ai)
}

const SYSTEM = `You generate business/product ideas for a solo founder AND, for each, a set of brand names chosen to MAXIMIZE the chance the .com or .ai is actually unregistered.

The single most important goal: names whose domains are likely STILL AVAILABLE. Short, obvious, single-real-word or common two-syllable coined names (like "Qualixa", "Rolevo", "Voxmatch") are almost always already taken. Avoid that whole style. Deliberately go for names that are less picked-over.

Tactics to find available names (use a mix across your suggestions):
- Invent genuinely novel words, not the tired "-ify / -ly / -ora / -ixa / vox- / -match" startup patterns.
- Real but unexpected words from nature, mythology, geography, or other languages, applied to the idea.
- Two-word real compounds that read naturally (e.g. "harborthread", "openkiln") rather than mashed nonsense.
- Slightly longer names (10 to 18 characters) are far more likely to be free than short 5 to 7 letter ones.
- Add a purposeful, non-generic word (not "app/hq/get/try") when it helps, e.g. a domain noun tied to the idea.

For each IDEA give:
- name: the primary brand name (letters only, no spaces, no hyphens, easy to say and spell).
- pitch: one punchy sentence on what it does and the value.
- audience: who it is for, in a few words.
- names: an array of 3 to 4 DISTINCT candidate brand names for this same idea (include the primary "name" as the first entry), each following the availability tactics above. These give multiple shots at an open domain.

Rules:
- Every name: letters only, lowercase-safe, no spaces, no hyphens, no numbers.
- Vary ideas widely. No repeats or near-duplicates.
- NEVER use em dashes anywhere. Use commas or periods.
- Return ONLY valid JSON, no markdown fences, in this exact shape:
{"ideas":[{"name":"...","pitch":"...","audience":"...","names":["...","...","..."]}]}`

function extractJson(text: string): { ideas?: Array<{ name?: string; pitch?: string; audience?: string; names?: string[] }> } {
  // Strip accidental code fences, then parse the first {...} block.
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

export async function generateIdeas(niche: string, count = 6): Promise<Idea[]> {
  // Sanitize: env values sometimes arrive with stray whitespace/newlines or an
  // accidentally duplicated value. Take the first non-empty line and trim it, so a
  // malformed paste can't produce an invalid Authorization header.
  const rawKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
  const apiKey = rawKey.split(/\s+/).find((s) => s.trim().length > 0)?.trim() || ''
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not set')
  }

  const google = createGoogleGenerativeAI({ apiKey })
  const prompt = niche.trim()
    ? `Generate ${count} ideas in this space: ${niche.trim()}`
    : `Generate ${count} diverse startup/product ideas a solo technical founder could build.`

  const { text } = await generateText({
    model: google('gemini-flash-latest'),
    system: SYSTEM,
    prompt,
  })

  const parsed = extractJson(text)
  const raw = Array.isArray(parsed.ideas) ? parsed.ideas : []

  return raw
    .filter((i) => i && typeof i.name === 'string' && i.name.trim())
    .slice(0, count)
    .map((i) => {
      // Collect the primary name plus the alternative candidates, de-duped.
      const nameList = [i.name || '', ...(Array.isArray(i.names) ? i.names : [])]
        .map((n) => (typeof n === 'string' ? n.trim() : ''))
        .filter(Boolean)
      const uniqueNames = Array.from(new Set(nameList.map((n) => n.toLowerCase())))
      // Build .com + .ai candidates for every distinct name (cap to keep checks reasonable).
      const domains = uniqueNames.slice(0, 4).flatMap((n) => candidatesFor(n))
      return {
        name: (i.name || '').trim(),
        pitch: (i.pitch || '').trim(),
        audience: (i.audience || '').trim(),
        domains,
      }
    })
}
