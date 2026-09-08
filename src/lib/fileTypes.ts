export type FileKind = 'txt' | 'md' | 'html' | 'csv' | 'json' | 'docx' | 'pdf'

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export interface FormatChip {
  kind: FileKind
  label: string
}

/** Displayed as chips near the drop zone, in the order given in the brief. */
export const SUPPORTED_FORMATS: FormatChip[] = [
  { kind: 'txt', label: 'TXT' },
  { kind: 'docx', label: 'DOCX' },
  { kind: 'pdf', label: 'PDF' },
  { kind: 'md', label: 'MD' },
  { kind: 'html', label: 'HTML' },
  { kind: 'csv', label: 'CSV' },
  { kind: 'json', label: 'JSON' },
]

export const ACCEPT_ATTRIBUTE = '.txt,.md,.markdown,.html,.htm,.csv,.json,.docx,.pdf'

const EXTENSION_TO_KIND: Record<string, FileKind> = {
  txt: 'txt',
  md: 'md',
  markdown: 'md',
  html: 'html',
  htm: 'html',
  csv: 'csv',
  json: 'json',
  docx: 'docx',
  pdf: 'pdf',
}

export function detectFileKind(filename: string): FileKind | null {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex < 0) return null
  const ext = filename.slice(dotIndex + 1).toLowerCase()
  return EXTENSION_TO_KIND[ext] ?? null
}

export interface FileValidationSuccess {
  ok: true
  kind: FileKind
}

export interface FileValidationFailure {
  ok: false
  message: string
}

export type FileValidationResult = FileValidationSuccess | FileValidationFailure

/**
 * Filenames are never trusted alone: size is checked here, and every
 * format's own parser (JSON.parse, DOMParser, PapaParse, JSZip, pdf.js)
 * validates the actual file content and fails safely if it doesn't match.
 */
export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, message: 'This file is larger than the 10 MB limit.' }
  }

  const lowerName = file.name.toLowerCase()
  if (lowerName.endsWith('.docm')) {
    return { ok: false, message: 'Macro-enabled Word documents (.docm) are not supported.' }
  }

  const kind = detectFileKind(file.name)
  if (!kind) {
    return { ok: false, message: 'This file type is not supported yet.' }
  }

  return { ok: true, kind }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function labelForKind(kind: FileKind): string {
  return SUPPORTED_FORMATS.find((f) => f.kind === kind)?.label ?? kind.toUpperCase()
}
