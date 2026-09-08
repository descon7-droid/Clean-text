import type { CleanResult, CleaningOptions } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import { cleanText } from './cleanText'

/**
 * Markdown is cleaned as text: artefact removal is safe everywhere in a
 * Markdown document, since it never rewrites Markdown syntax itself
 * (headings, lists, emphasis markers, links) — only invisible characters.
 */
export function cleanMarkdown(input: string, options: CleaningOptions = DEFAULT_CLEANING_OPTIONS): CleanResult {
  return cleanText(input, options)
}
