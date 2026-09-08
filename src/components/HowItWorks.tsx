const STEPS = [
  {
    number: '1',
    title: 'Add your content',
    body: 'Paste text or choose a document.',
  },
  {
    number: '2',
    title: 'Clean locally',
    body: 'Hidden Unicode and formatting artefacts are inspected in your browser.',
  },
  {
    number: '3',
    title: 'Copy or download',
    body: 'Use the cleaned result immediately.',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 id="how-it-works-heading" className="text-xl font-semibold tracking-tight text-ink">
        How it works
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.number} className="rounded-xl border border-border bg-surface p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-mono text-sm font-semibold text-accent-strong">
              {step.number}
            </span>
            <h3 className="mt-4 text-sm font-semibold text-ink">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
