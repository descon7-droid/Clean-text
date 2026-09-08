import { CheckCircle2 } from 'lucide-react'
import type { CleanCounts } from '../types/cleaning'

interface ResultSummaryProps {
  counts: CleanCounts
  originalLength?: number
  cleanedLength?: number
}

function buildMetricLines(counts: CleanCounts): string[] {
  const lines: string[] = []
  const hiddenCharsRemoved = counts.zeroWidthRemoved + counts.bidiRemoved + counts.controlRemoved

  if (hiddenCharsRemoved > 0) {
    lines.push(`${hiddenCharsRemoved} hidden character${hiddenCharsRemoved === 1 ? '' : 's'} removed`)
  }
  if (counts.nbspConverted > 0) {
    lines.push(`${counts.nbspConverted} non-breaking space${counts.nbspConverted === 1 ? '' : 's'} converted`)
  }
  if (counts.softHyphenRemoved > 0) {
    lines.push(`${counts.softHyphenRemoved} soft hyphen${counts.softHyphenRemoved === 1 ? '' : 's'} removed`)
  }
  if (counts.unusualWhitespaceNormalized > 0) {
    lines.push(`${counts.unusualWhitespaceNormalized} unusual space${counts.unusualWhitespaceNormalized === 1 ? '' : 's'} normalised`)
  }
  if (counts.whitespaceCollapsed > 0) {
    lines.push(`${counts.whitespaceCollapsed} run${counts.whitespaceCollapsed === 1 ? '' : 's'} of whitespace collapsed`)
  }
  if (counts.unicodeNormalized > 0) {
    lines.push(`${counts.unicodeNormalized} character${counts.unicodeNormalized === 1 ? '' : 's'} Unicode-normalised`)
  }
  return lines
}

export function ResultSummary({ counts, originalLength, cleanedLength }: ResultSummaryProps) {
  const lines = buildMetricLines(counts)

  return (
    <div className="rounded-xl border border-accent-soft bg-accent-soft/60 p-5">
      <div className="flex items-center gap-2 text-accent-strong">
        <CheckCircle2 size={18} aria-hidden="true" />
        <h3 className="text-sm font-semibold">Cleaned successfully</h3>
      </div>

      {lines.length > 0 ? (
        <ul className="mt-3 grid gap-1.5 text-sm text-ink-soft sm:grid-cols-2">
          {lines.map((line) => (
            <li key={line} className="flex items-baseline gap-1.5">
              <span className="text-accent-strong">•</span>
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">No hidden characters or artefacts were found.</p>
      )}

      {originalLength != null && cleanedLength != null && (
        <div className="mt-4 flex gap-6 border-t border-accent-soft pt-3 font-mono text-xs text-muted">
          <span>Original: {originalLength.toLocaleString()} chars</span>
          <span>Cleaned: {cleanedLength.toLocaleString()} chars</span>
        </div>
      )}
    </div>
  )
}
