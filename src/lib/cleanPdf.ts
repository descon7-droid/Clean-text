import type { CleanCounts, CleaningOptions, Finding } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import { cleanText } from './cleanText'

export interface PdfCleanSuccess {
  ok: true
  cleanedText: string
  counts: CleanCounts
  findings: Finding[]
  pageCount: number
  originalLength: number
  cleanedLength: number
}

export type PdfFailureReason = 'encrypted' | 'no-text' | 'damaged'

export interface PdfCleanFailure {
  ok: false
  reason: PdfFailureReason
  error: string
}

export type PdfCleanResult = PdfCleanSuccess | PdfCleanFailure

interface PdfTextRunItem {
  str: string
  transform: number[]
  width: number
  hasEOL?: boolean
}

function isTextRunItem(item: unknown): item is PdfTextRunItem {
  return typeof item === 'object' && item !== null && 'str' in item && 'transform' in item
}

/**
 * Reconstructs a page's text from pdf.js's text items. Items are runs of
 * glyphs, not words or lines — PDF renderers routinely split a run at a
 * soft hyphen or font change with zero gap between the pieces, so a naive
 * space-join fabricates a space that was never there (e.g. a soft-hyphenated
 * "sub|tle" becomes "sub tle"). Only insert a join space when there's an
 * actual horizontal gap between runs, and use pdf.js's own `hasEOL` flag to
 * preserve line breaks — otherwise multi-line text collapses onto one line.
 */
export function extractPageText(items: unknown[]): string {
  let text = ''
  let prevEndX: number | null = null

  for (const raw of items) {
    if (!isTextRunItem(raw)) continue
    const x = raw.transform[4]

    if (prevEndX !== null && raw.str) {
      const gap = x - prevEndX
      if (gap > 1) {
        text += ' '
      }
    }

    text += raw.str

    if (raw.hasEOL) {
      text += '\n'
      prevEndX = null
    } else {
      prevEndX = x + raw.width
    }
  }

  return text
}

/**
 * Extracts selectable text from a PDF using pdfjs-dist (loaded via dynamic
 * import so the ~1MB library is never fetched until a PDF is actually
 * processed) and cleans the extracted text. Everything runs locally; the
 * PDF bytes are never uploaded anywhere. Layout is not reconstructed —
 * only the text stream is extracted, in reading order.
 */
export async function cleanPdf(
  data: ArrayBuffer,
  options: CleaningOptions = DEFAULT_CLEANING_OPTIONS,
): Promise<PdfCleanResult> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()

  let doc: Awaited<ReturnType<typeof pdfjs.getDocument>['promise']>
  try {
    doc = await pdfjs.getDocument({ data }).promise
  } catch (err: unknown) {
    const name = err instanceof Error ? err.name : ''
    if (name === 'PasswordException') {
      return {
        ok: false,
        reason: 'encrypted',
        error: 'This PDF is password protected and cannot currently be processed.',
      }
    }
    return {
      ok: false,
      reason: 'damaged',
      error: 'This PDF could not be read. It may be damaged or use an unsupported format.',
    }
  }

  let fullText = ''
  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum)
      const content = await page.getTextContent()
      fullText += extractPageText(content.items) + '\n\n'
    }
  } catch {
    return {
      ok: false,
      reason: 'damaged',
      error: 'This PDF could not be read. It may be damaged or use an unsupported format.',
    }
  }

  if (!fullText.trim()) {
    return {
      ok: false,
      reason: 'no-text',
      error: 'No extractable text was found. This PDF may be scanned or image-based. OCR is not included in this version.',
    }
  }

  const result = cleanText(fullText.trim(), options)
  return {
    ok: true,
    cleanedText: result.cleanedText,
    counts: result.counts,
    findings: result.findings,
    pageCount: doc.numPages,
    originalLength: result.originalLength,
    cleanedLength: result.cleanedLength,
  }
}
