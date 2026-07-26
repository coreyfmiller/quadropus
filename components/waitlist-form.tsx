"use client"

import { useState } from "react"
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react"

export function WaitlistForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) return

    setStatus("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle2 className="size-5 text-green-500" />
        <p className="text-sm font-medium text-foreground">You're on the list. We'll be in touch.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row items-stretch gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_10px_40px_-12px_var(--brand)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        style={{
          backgroundImage: "linear-gradient(100deg, var(--brand), var(--brand-alt))",
        }}
      >
        {status === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Get Early Access
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500 sm:absolute sm:-bottom-6">Something went wrong. Try again.</p>
      )}
    </form>
  )
}
