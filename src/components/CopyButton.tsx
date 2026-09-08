import { useState } from 'react'
import { ClipboardCheck, Copy } from 'lucide-react'

interface CopyButtonProps {
  getText: () => string
  label?: string
}

export function CopyButton({ getText, label = 'Copy cleaned text' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API unavailable — no-op; the text is still visible to select manually.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
    >
      {copied ? (
        <>
          <ClipboardCheck size={15} className="text-accent" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Copy size={15} aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  )
}
