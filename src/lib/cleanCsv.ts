import Papa from 'papaparse'
import type { CleanCounts, CleaningOptions, Finding } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import { cleanText, createEmptyCounts, mergeCounts } from './cleanText'

export interface CsvCleanSuccess {
  ok: true
  cleanedCsv: string
  counts: CleanCounts
  findings: Finding[]
  delimiter: string
}

export interface CsvCleanFailure {
  ok: false
  error: string
}

export type CsvCleanResult = CsvCleanSuccess | CsvCleanFailure

/**
 * Parses CSV with PapaParse (handles quoting, escaped quotes, multiline
 * fields, and comma / semicolon / tab delimiters), cleans only cell text,
 * then re-serializes preserving the detected delimiter.
 */
export function cleanCsv(input: string, options: CleaningOptions = DEFAULT_CLEANING_OPTIONS): CsvCleanResult {
  const parsed = Papa.parse<string[]>(input, {
    skipEmptyLines: false,
  })

  if (!parsed.data || parsed.data.length === 0) {
    return { ok: false, error: 'This CSV file could not be read and was not modified.' }
  }

  const delimiter = parsed.meta.delimiter || ','
  let counts = createEmptyCounts()
  const findings: Finding[] = []

  const rows = parsed.data.map((row) =>
    row.map((cell) => {
      if (!cell) return cell
      const result = cleanText(cell, options)
      counts = mergeCounts(counts, result.counts)
      findings.push(...result.findings)
      return result.cleanedText
    }),
  )

  const cleanedCsv = Papa.unparse(rows, { delimiter })

  return { ok: true, cleanedCsv, counts, findings, delimiter }
}
