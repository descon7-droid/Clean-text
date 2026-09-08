import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Finding, FindingAction, FindingCategory } from '../types/cleaning'
import { MAX_INSPECTOR_FINDINGS } from '../types/cleaning'

const CATEGORY_LABELS: Record<FindingCategory, string> = {
  'zero-width': 'Zero-width',
  bidi: 'Directional',
  whitespace: 'Whitespace',
  control: 'Control',
  formatting: 'Formatting',
  normalization: 'Normalisation',
}

const ACTION_LABELS: Record<FindingAction, string> = {
  removed: 'Removed',
  converted: 'Converted',
  preserved: 'Preserved',
  normalized: 'Normalised',
}

const ACTION_STYLES: Record<FindingAction, string> = {
  removed: 'bg-danger-soft text-danger',
  converted: 'bg-accent-soft text-accent-strong',
  preserved: 'bg-surface-muted text-ink-soft',
  normalized: 'bg-accent-soft text-accent-strong',
}

interface InspectorProps {
  findings: Finding[]
}

export function Inspector({ findings }: InspectorProps) {
  const [open, setOpen] = useState(false)
  const visible = findings.slice(0, MAX_INSPECTOR_FINDINGS)

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="inspector-panel"
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
        disabled={findings.length === 0}
      >
        <span className="text-sm font-medium text-ink">
          Inspect changes {findings.length > 0 && <span className="text-muted">({findings.length})</span>}
        </span>
        {findings.length > 0 && (
          <ChevronDown
            size={16}
            className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        )}
      </button>
      {open && findings.length > 0 && (
        <div id="inspector-panel" className="border-t border-border">
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-muted text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Position
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Code point
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Character
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((finding, idx) => (
                  <tr key={`${finding.index}-${idx}`} className="border-t border-border">
                    <td className="px-4 py-2 font-mono text-xs text-muted">{finding.index}</td>
                    <td className="px-4 py-2 font-mono text-xs text-ink-soft">{finding.unicode}</td>
                    <td className="px-4 py-2 text-ink-soft">{finding.name}</td>
                    <td className="px-4 py-2 text-ink-soft">{CATEGORY_LABELS[finding.category]}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_STYLES[finding.action]}`}
                      >
                        {ACTION_LABELS[finding.action]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {findings.length > MAX_INSPECTOR_FINDINGS && (
            <p className="border-t border-border px-4 py-2.5 text-xs text-muted">
              Showing first {MAX_INSPECTOR_FINDINGS.toLocaleString()} of {findings.length.toLocaleString()} detections.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
