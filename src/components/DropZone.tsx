import { useId, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import { FileText, UploadCloud } from 'lucide-react'
import { ACCEPT_ATTRIBUTE, SUPPORTED_FORMATS, formatFileSize, MAX_FILE_SIZE_BYTES } from '../lib/fileTypes'

interface DropZoneProps {
  onFileSelected: (file: File) => void
  selectedFileName?: string | null
  selectedFileSize?: number | null
}

export function DropZone({ onFileSelected, selectedFileName, selectedFileSize }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) onFileSelected(file)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onFileSelected(file)
    event.target.value = ''
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-describedby={`${inputId}-hint`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragActive(true)
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragActive
            ? 'border-accent bg-accent-soft'
            : 'border-border-strong bg-surface-muted hover:border-accent/60 hover:bg-accent-soft/40'
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={handleChange}
          className="sr-only"
          aria-label="Choose a document to clean"
        />
        {selectedFileName ? (
          <>
            <FileText size={28} className="mb-3 text-accent" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">{selectedFileName}</p>
            {selectedFileSize != null && (
              <p className="mt-1 text-xs text-muted">{formatFileSize(selectedFileSize)}</p>
            )}
            <p className="mt-3 text-xs text-muted">Click or drop another file to replace it</p>
          </>
        ) : (
          <>
            <UploadCloud size={28} className="mb-3 text-muted" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">Drop a document here</p>
            <p className="mt-1 text-sm text-muted">or choose a file from your device</p>
          </>
        )}
      </div>
      <p id={`${inputId}-hint`} className="mt-3 text-xs text-muted">
        TXT, DOCX, PDF, MD, HTML, CSV and JSON supported · up to {MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUPPORTED_FORMATS.map((format) => (
          <span
            key={format.kind}
            className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-ink-soft"
          >
            {format.label}
          </span>
        ))}
      </div>
    </div>
  )
}
