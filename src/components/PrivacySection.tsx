import { ShieldCheck } from 'lucide-react'

export function PrivacySection() {
  return (
    <section aria-labelledby="privacy-heading" className="border-y border-border bg-surface-muted">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cta text-cta-ink">
          <ShieldCheck size={20} aria-hidden="true" />
        </span>
        <h2 id="privacy-heading" className="font-display text-2xl font-bold tracking-tight text-ink">
          Private by design
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Your files and text never leave your device. Cleaning happens locally inside your browser — nothing
          is uploaded to a server, stored, or sent to any AI or analytics service.
        </p>
      </div>
    </section>
  )
}
