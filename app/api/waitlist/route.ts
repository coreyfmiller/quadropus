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

    // Also store in Vercel Blob for a persistent list.
    //
    // PRIVATE. This file is every email address that ever signed up. It used to be
    // written with `access: "public"` and `addRandomSuffix: false`, which put the whole
    // list at a guessable URL that needed no credential to read — a ready-made list for
    // anyone who found the store hostname. Private blobs need the store token, so the
    // read below passes `access: 'private'` as well.
    try {
      const { put, get } = await import("@vercel/blob")
      const BLOB_KEY = "quadropus/waitlist.json"

      let entries: { email: string; date: string }[] = []

      // Get existing entries. `get` resolves to null only when nothing has been
      // written yet; a store that can't be reached throws, which the outer catch
      // logs — and crucially it skips the `put` below, so an unreachable read can
      // never overwrite the list with a single entry and lose every prior signup.
      const found = await get(BLOB_KEY, { access: "private", useCache: false })
      if (found?.stream) {
        const parsed = JSON.parse(await new Response(found.stream).text())
        if (Array.isArray(parsed)) entries = parsed
      }

      // Check for duplicates
      if (entries.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
        return NextResponse.json({ success: true, message: "already_joined" })
      }

      // Add new entry
      entries.push({ email: email.toLowerCase(), date: new Date().toISOString() })

      await put(BLOB_KEY, JSON.stringify(entries), {
        access: "private",
        contentType: "application/json",
        allowOverwrite: true,
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
