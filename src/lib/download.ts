/** Triggers a browser download for a Blob and revokes the object URL afterwards. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(text: string, filename: string, mimeType = 'text/plain;charset=utf-8'): void {
  downloadBlob(new Blob([text], { type: mimeType }), filename)
}

/** e.g. buildCleanedFilename('notes.md') -> 'notes-cleaned.md' */
export function buildCleanedFilename(originalName: string, newExtension?: string): string {
  const dotIndex = originalName.lastIndexOf('.')
  const base = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName
  const ext = newExtension ?? (dotIndex > 0 ? originalName.slice(dotIndex + 1) : 'txt')
  return `${base}-cleaned.${ext}`
}
