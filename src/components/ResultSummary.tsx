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
    <div className="rounded-xl bg-ink p-5 text-[#f2f4ea]">
      <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wide text-lime">
        <CheckCircle2 size={15} aria-hidden="true" />
        Cleaned successfully
      </div>

      {lines.length > 0 ? (
        <ul className="mt-3.5 grid gap-2 text-sm sm:grid-cols-2">
          {lines.map((line) => (
            <li key={line} className="flex items-baseline gap-1.5">
              <span className="text-sage">•</span>
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3.5 text-sm text-[#c8ccbc]">No hidden characters or artefacts were found.</p>
      )}

      {originalLength != null && cleanedLength != null && (
        <div className="mt-4 flex gap-6 border-t border-white/10 pt-3 font-mono text-xs text-[#9a9d90]">
          <span>Original: {originalLength.toLocaleString()} chars</span>
          <span>Cleaned: {cleanedLength.toLocaleString()} chars</span>
        </div>
      )}
    </div>
  )
}
