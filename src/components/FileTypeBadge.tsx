import { labelForKind, type FileKind } from '../lib/fileTypes'

export function FileTypeBadge({ kind }: { kind: FileKind }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border-strong bg-surface-muted px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide text-ink-soft">
      {labelForKind(kind)}
    </span>
  )
}
