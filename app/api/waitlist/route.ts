import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = process.env.RESEND_API_KEY || ""
const NOTIFICATION_EMAIL = "coreyfmiller@gmail.com"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    // Send notification to you
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Quadropus.ai <corey@duelly.ai>",
          to: NOTIFICATION_EMAIL,
          subject: `New Quadropus Waitlist Signup: ${email}`,
          text: `New waitlist signup on quadropus.ai:\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`,
        }),
      })
    }

    // Also store in Vercel Blob for a persistent list
    try {
      const { put, list: blobList } = await import("@vercel/blob")
      const BLOB_KEY = "quadropus/waitlist.json"

      let entries: { email: string; date: string }[] = []

      // Get existing entries
      const { blobs } = await blobList({ prefix: "quadropus/" })
      const existing = blobs.find((b) => b.pathname === BLOB_KEY)
      if (existing) {
        const res = await fetch(existing.url)
        entries = await res.json()
      }

      // Check for duplicates
      if (entries.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
        return NextResponse.json({ success: true, message: "already_joined" })
      }

      // Add new entry
      entries.push({ email: email.toLowerCase(), date: new Date().toISOString() })

      await put(BLOB_KEY, JSON.stringify(entries), {
        access: "public",
        addRandomSuffix: false,
      })
    } catch (err) {
      // Blob storage is optional — notification email is the important part
      console.error("Blob storage error:", err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Waitlist error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
