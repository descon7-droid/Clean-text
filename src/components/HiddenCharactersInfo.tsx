const CARDS = [
  {
    unicode: 'U+200B',
    name: 'Zero-width space',
    body: 'Invisible spacing character often left behind by copy-pasted web text.',
  },
  {
    unicode: 'U+200D',
    name: 'Zero-width joiner',
    body: 'Joins characters together — needed for emoji and some scripts, so it is kept when meaningful.',
  },
  {
    unicode: 'U+FEFF',
    name: 'Byte order mark',
    body: 'A file-encoding marker that can appear as a stray character at the start of text.',
  },
  {
    unicode: 'U+00A0',
    name: 'Non-breaking space',
    body: 'Looks like a normal space but behaves differently — common in text copied from web pages.',
  },
  {
    unicode: 'U+00AD',
    name: 'Soft hyphen',
    body: 'An invisible hyphenation hint frequently picked up from PDFs and websites.',
  },
  {
    unicode: 'U+202E',
    name: 'Bidi control marks',
    body: 'Directional formatting marks that can hide or reorder text unexpectedly.',
  },
]

export function HiddenCharactersInfo() {
  return (
    <section aria-labelledby="hidden-characters-heading" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 id="hidden-characters-heading" className="text-xl font-semibold tracking-tight text-ink">
        Common hidden characters
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        A few of the technical artefacts CleanText looks for. You don't need to know any of this to use it.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <div key={card.unicode} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-soft">
                {card.unicode}
              </span>
              <h3 className="text-sm font-semibold text-ink">{card.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
