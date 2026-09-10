import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { Clipboard, X } from 'lucide-react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  disabled?: boolean
}

export function TextInput({ value, onChange, onClear, disabled }: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const charCount = Array.from(value).length

  async function handlePasteClick() {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText()
        onChange(value ? `${value}${text}` : text)
        return
      }
    } catch {
      // Clipboard permission denied or unavailable — fall back to manual paste.
    }
    textareaRef.current?.focus()
  }

  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="paste-text" className="text-sm font-medium text-ink">
          Paste text
        </label>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {charCount.toLocaleString()} characters
        </span>
      </div>
      <textarea
        ref={textareaRef}
        id="paste-text"
        value={value}
        onChange={handleTextareaChange}
        disabled={disabled}
        placeholder="Paste text here to inspect and clean hidden characters…"
        rows={10}
        className="w-full resize-y rounded-xl border border-border-strong bg-surface p-4 font-mono text-sm leading-relaxed text-ink shadow-soft outline-none placeholder:text-muted focus:border-accent disabled:opacity-60"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePasteClick}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:border-accent/50 hover:text-ink active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
        >
          <Clipboard size={15} aria-hidden="true" />
          Paste
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || value.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-ink disabled:opacity-50"
        >
          <X size={15} aria-hidden="true" />
          Clear
        </button>
      </div>
    </div>
  )
}
