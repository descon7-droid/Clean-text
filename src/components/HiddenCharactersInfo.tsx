import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

const CARDS = [
  {
    unicode: 'U+200B',
    escape: '\\u200B',
    name: 'Zero-width space',
    body: 'Invisible spacing character often left behind by copy-pasted web text.',
  },
  {
    unicode: 'U+200D',
    escape: '\\u200D',
    name: 'Zero-width joiner',
    body: 'Joins characters together — needed for emoji and some scripts, so it is kept when meaningful.',
  },
  {
    unicode: 'U+FEFF',
    escape: '\\uFEFF',
    name: 'Byte order mark',
    body: 'A file-encoding marker that can appear as a stray character at the start of text.',
  },
  {
    unicode: 'U+00A0',
    escape: '\\u00A0',
    name: 'Non-breaking space',
    body: 'Looks like a normal space but behaves differently — common in text copied from web pages.',
  },
  {
    unicode: 'U+00AD',
    escape: '\\u00AD',
    name: 'Soft hyphen',
    body: 'An invisible hyphenation hint frequently picked up from PDFs and websites.',
  },
  {
    unicode: 'U+202E',
    escape: '\\u202E',
    name: 'Bidi control marks',
    body: 'Directional formatting marks that can hide or reorder text unexpectedly.',
  },
]

function HiddenCharCard({ card }: { card: (typeof CARDS)[number] }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(card.escape)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API unavailable — no-op.
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 font-mono shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-700">{card.unicode}</span>
          <h3 className="text-sm font-bold text-neutral-900">{card.name}</h3>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${card.escape}`}
          className="shrink-0 rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
        >
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-500">{card.body}</p>
    </div>
  )
}

export function HiddenCharactersInfo() {
  return (
    <section aria-labelledby="hidden-characters-heading" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 id="hidden-characters-heading" className="font-display text-2xl font-bold tracking-tight text-ink">
        Common hidden characters
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        A few of the technical artefacts WordWasher looks for. You don't need to know any of this to use it.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <HiddenCharCard key={card.unicode} card={card} />
        ))}
      </div>
    </section>
  )
}
