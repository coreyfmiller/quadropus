/**
 * Lead store for the ops command center, backed by Vercel Blob (same storage the
 * waitlist already uses, so no new infra). FundyLaunch and FundyLogic contact forms
 * POST leads here in addition to their existing Resend emails.
 *
 * PRIVATE, deliberately. A lead carries a name, an email, a phone number and
 * whatever the person typed into a contact form. Written with `access: 'public'`
 * at a fixed pathname, the file sits at a predictable
 * `https://<store>.public.blob.vercel-storage.com/quadropus/leads.json` and anyone
 * who learns the store hostname can read every lead. Private blobs require the
 * store token to read, so `get` below must pass `access: 'private'` too.
 */

import { put, get } from '@vercel/blob'

const BLOB_KEY = 'quadropus/leads.json'

export interface Lead {
  id: string
  source: string // e.g. 'fundylaunch', 'fundylogic', 'fundylogic-voice'
  name: string
  /**
   * Optional: a phone lead from the voice agent usually has no email. At least one
   * of `email` or `phone` is always present — the ingest route enforces that.
   */
  email?: string
  business?: string
  phone?: string
  message?: string
  /** FundyLogic's "what are you looking for" dropdown, already mapped to readable text. */
  wants?: string
  formType?: string
  /** Whatever the voice assistant's analysis plan captured, if anything. */
  structured?: Record<string, unknown>
  createdAt: string
}

export type NewLead = Omit<Lead, 'id' | 'createdAt'>

/**
 * Reads the stored leads.
 *
 * Only "the file isn't there yet" counts as an empty list. Every other failure —
 * no store connected, a missing token, malformed JSON — is rethrown, because an
 * empty lead list and a broken lead store look identical on the dashboard and the
 * second one needs fixing. Swallowing these is what let the store stay unprovisioned
 * without anyone noticing.
 */
async function readAll(): Promise<Lead[]> {
  // `get` resolves to null when nothing has been written yet, which is the only
  // honest empty list. Every other failure throws and is deliberately left to
  // throw: no store connected, no token, malformed JSON.
  const found = await get(BLOB_KEY, { access: 'private', useCache: false })
  if (!found?.stream) return []
  const data = JSON.parse(await new Response(found.stream).text())
  return Array.isArray(data) ? data : []
}

export async function getLeads(): Promise<Lead[]> {
  const leads = await readAll()
  // Newest first.
  return leads.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function addLead(input: NewLead): Promise<Lead> {
  const leads = await readAll()
  const lead: Lead = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
  leads.push(lead)
  // Keep the file bounded (last 500 leads).
  const trimmed = leads.slice(-500)
  await put(BLOB_KEY, JSON.stringify(trimmed), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
  })
  return lead
}
