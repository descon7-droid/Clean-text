import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CleaningOptions as CleaningOptionsType } from '../types/cleaning'

interface OptionDef {
  key: keyof CleaningOptionsType
  label: string
  description: string
}

const OPTION_DEFS: OptionDef[] = [
  {
    key: 'removeZeroWidth',
    label: 'Remove zero-width characters',
    description: 'Zero-width spaces, joiners and BOM markers. Emoji and complex-script joiners are kept.',
  },
  {
    key: 'removeBidiControls',
    label: 'Remove directional / bidi controls',
    description: 'Hidden left-to-right / right-to-left override and isolate marks.',
  },
  {
    key: 'convertNbsp',
    label: 'Convert non-breaking spaces',
    description: 'Turns non-breaking spaces into ordinary spaces.',
  },
  {
    key: 'removeSoftHyphens',
    label: 'Remove soft hyphens',
    description: 'Invisible hyphenation hints often left behind by PDFs and web pages.',
  },
  {
    key: 'removeControlChars',
    label: 'Remove unwanted control characters',
    description: 'Non-printing control characters, excluding normal line breaks and tabs.',
  },
  {
    key: 'normalizeUnusualWhitespace',
    label: 'Normalise unusual whitespace',
    description: 'Converts uncommon space characters (e.g. ideographic, hair space) to a regular space.',
  },
  {
    key: 'collapseRepeatedSpaces',
    label: 'Collapse repeated spaces',
    description: 'Reduces runs of spaces to one, and trims trailing spaces on each line.',
  },
  {
    key: 'normalizeLineEndings',
    label: 'Normalise line endings',
    description: 'Converts Windows (CRLF) and old Mac (CR) line endings to a single LF style.',
  },
  {
    key: 'preserveParagraphBreaks',
    label: 'Preserve paragraph breaks',
    description: 'Keeps a single blank line between paragraphs instead of removing it entirely.',
  },
  {
    key: 'unicodeNfcNormalize',
    label: 'Unicode NFC normalisation',
    description: 'Standardises equivalent character representations without changing how text looks.',
  },
]

interface CleaningOptionsProps {
  options: CleaningOptionsType
  onChange: (options: CleaningOptionsType) => void
}

export function CleaningOptions({ options, onChange }: CleaningOptionsProps) {
  const [open, setOpen] = useState(false)

  function toggle(key: keyof CleaningOptionsType) {
    onChange({ ...options, [key]: !options[key] })
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="advanced-cleaning-options-panel"
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-ink">Advanced cleaning options</span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id="advanced-cleaning-options-panel" className="border-t border-border px-4 py-4">
          <p className="mb-4 text-xs text-muted">
            Sensible defaults are already selected. Most people never need to change these.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {OPTION_DEFS.map((def) => (
              <label key={def.key} className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={options[def.key]}
                  onChange={() => toggle(def.key)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong text-accent accent-[var(--color-accent)]"
                />
                <span>
                  <span className="block font-medium text-ink">{def.label}</span>
                  <span className="block text-xs text-muted">{def.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
