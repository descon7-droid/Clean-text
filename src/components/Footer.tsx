export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          WordWasher cleans formatting and invisible characters. It is not designed to alter authorship
          signals or circumvent AI-detection systems. As a side effect of removing invisible Unicode
          characters, some hidden markers embedded in copied text may also be removed.
        </p>
        <div className="mt-6 flex flex-col gap-2 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} WordWasher. Processing happens locally in your browser.</span>
          <span>No account required.</span>
        </div>
      </div>
    </footer>
  )
}
