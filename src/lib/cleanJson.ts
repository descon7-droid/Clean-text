import type { CleanCounts, CleaningOptions, Finding } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import { cleanText, createEmptyCounts, mergeCounts } from './cleanText'

export interface JsonCleanSuccess {
  ok: true
  cleanedJson: string
  counts: CleanCounts
  findings: Finding[]
  stringsCleaned: number
}

export interface JsonCleanFailure {
  ok: false
  error: string
}

export type JsonCleanResult = JsonCleanSuccess | JsonCleanFailure

/**
 * Parses JSON, cleans only string values (recursively, through objects and
 * arrays), and re-serializes. Keys, numbers, booleans, null and structure
 * are always preserved untouched. Invalid JSON is never modified.
 */
export function cleanJson(input: string, options: CleaningOptions = DEFAULT_CLEANING_OPTIONS): JsonCleanResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    return { ok: false, error: 'This JSON file is not valid and was not modified.' }
  }

  let counts = createEmptyCounts()
  const findings: Finding[] = []
  let stringsCleaned = 0

  function walk(value: unknown): unknown {
    if (typeof value === 'string') {
      const result = cleanText(value, options)
      counts = mergeCounts(counts, result.counts)
      findings.push(...result.findings)
      stringsCleaned++
      return result.cleanedText
    }
    if (Array.isArray(value)) {
      return value.map(walk)
    }
    if (value !== null && typeof value === 'object') {
      const out: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        out[key] = walk(val)
      }
      return out
    }
    return value
  }

  const cleanedValue = walk(parsed)
  const cleanedJson = JSON.stringify(cleanedValue, null, 2)

  return { ok: true, cleanedJson, counts, findings, stringsCleaned }
}
