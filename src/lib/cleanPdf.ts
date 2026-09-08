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
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
      fullText += pageText + '\n\n'
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
