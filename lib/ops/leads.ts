/**
 * Lead store for the ops command center, backed by Vercel Blob (same storage the
 * waitlist already uses, so no new infra). FundyLaunch and FundyLogic contact forms
 * POST leads here in addition to their existing Resend emails.
 */

import { put, list } from '@vercel/blob'

const BLOB_KEY = 'quadropus/leads.json'

export interface Lead {
  id: string
  source: string // e.g. 'fundylaunch', 'fundylogic'
  name: string
  email: string
  business?: string
  phone?: string
  message?: string
  formType?: string
  createdAt: string
}

export type NewLead = Omit<Lead, 'id' | 'createdAt'>

async function readAll(): Promise<Lead[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 })
    const found = blobs.find((b) => b.pathname === BLOB_KEY)
    if (!found) return []
    const res = await fetch(found.url, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
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
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  })
  return lead
}
