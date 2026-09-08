import type { CleanResult, CleaningOptions } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import { cleanText } from './cleanText'

/** Plain text cleaning is the base engine with no format-specific handling. */
export function cleanTxt(input: string, options: CleaningOptions = DEFAULT_CLEANING_OPTIONS): CleanResult {
  return cleanText(input, options)
}
