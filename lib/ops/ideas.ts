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

const SYSTEM = `You generate brandable business and product ideas for a solo founder.

For each idea give:
- name: a SHORT, brandable, inventable name (one or two words, easy to spell, no generic dictionary phrases). It should work as a domain. Prefer coined/made-up words or clever compounds.
- pitch: one punchy sentence on what it does and the value.
- audience: who it is for, in a few words.

Rules:
- Names must be domain-friendly: letters only, no spaces, no hyphens, ideally under 14 characters.
- Aim for names likely to have an available .com or .ai.
- Vary the ideas. No repeats, no near-duplicates.
- NEVER use em dashes anywhere. Use commas or periods.
- Return ONLY valid JSON, no markdown fences, in this exact shape:
{"ideas":[{"name":"...","pitch":"...","audience":"..."}]}`

function extractJson(text: string): { ideas?: Array<{ name?: string; pitch?: string; audience?: string }> } {
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
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
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
    .map((i) => ({
      name: (i.name || '').trim(),
      pitch: (i.pitch || '').trim(),
      audience: (i.audience || '').trim(),
      domains: candidatesFor(i.name || ''),
    }))
}
