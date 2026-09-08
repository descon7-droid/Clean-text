import JSZip from 'jszip'
import type { CleanCounts, CleaningOptions, Finding } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import { cleanText, createEmptyCounts, mergeCounts } from './cleanText'

export interface DocxCleanSuccess {
  ok: true
  blob: Blob
  counts: CleanCounts
  findings: Finding[]
}

export interface DocxCleanFailure {
  ok: false
  error: string
}

export type DocxCleanResult = DocxCleanSuccess | DocxCleanFailure

/** word/document.xml, headers, footers, footnotes, endnotes, comments. */
const TARGET_XML_PATTERN = /^word\/(document|header\d*|footer\d*|footnotes|endnotes|comments)\.xml$/

function unescapeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function escapeXmlEntities(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Cleans a .docx file entirely client-side: unzips the OOXML package with
 * JSZip, rewrites only the text inside <w:t> runs in the document body,
 * headers, footers, footnotes, endnotes and comments, and repackages the
 * zip. Every other XML part (styles, tables, formatting, media) is left
 * byte-for-byte untouched, so structure and formatting round-trip.
 */
export async function cleanDocx(
  file: Blob | ArrayBuffer,
  options: CleaningOptions = DEFAULT_CLEANING_OPTIONS,
): Promise<DocxCleanResult> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    return { ok: false, error: 'This Word document could not be read.' }
  }

  if (zip.file('word/vbaProject.bin')) {
    return { ok: false, error: 'Macro-enabled Word documents (.docm) are not supported.' }
  }

  const targets = Object.keys(zip.files).filter(
    (name) => TARGET_XML_PATTERN.test(name) && !zip.files[name].dir,
  )

  if (targets.length === 0 || !zip.file('word/document.xml')) {
    return { ok: false, error: 'This Word document could not be read.' }
  }

  let counts = createEmptyCounts()
  const findings: Finding[] = []
  const runPattern = /(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g

  try {
    for (const path of targets) {
      const xml = await zip.file(path)!.async('string')
      const cleanedXml = xml.replace(runPattern, (_match, open: string, text: string, close: string) => {
        if (!text) return open + text + close
        const decoded = unescapeXmlEntities(text)
        const result = cleanText(decoded, options)
        counts = mergeCounts(counts, result.counts)
        findings.push(...result.findings)
        return open + escapeXmlEntities(result.cleanedText) + close
      })
      zip.file(path, cleanedXml)
    }
  } catch {
    return { ok: false, error: 'This Word document could not be read.' }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  return { ok: true, blob, counts, findings }
}
