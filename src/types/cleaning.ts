export type FindingCategory =
  | 'zero-width'
  | 'bidi'
  | 'whitespace'
  | 'control'
  | 'formatting'
  | 'normalization'

export type FindingAction = 'removed' | 'converted' | 'preserved' | 'normalized'

export interface Finding {
  index: number
  codePoint: number
  unicode: string
  name: string
  category: FindingCategory
  action: FindingAction
}

export interface CleanCounts {
  zeroWidthRemoved: number
  bidiRemoved: number
  controlRemoved: number
  nbspConverted: number
  softHyphenRemoved: number
  unusualWhitespaceNormalized: number
  whitespaceCollapsed: number
  unicodeNormalized: number
}

export interface CleanResult {
  cleanedText: string
  originalLength: number
  cleanedLength: number
  counts: CleanCounts
  findings: Finding[]
}

export interface CleaningOptions {
  removeZeroWidth: boolean
  removeBidiControls: boolean
  convertNbsp: boolean
  removeSoftHyphens: boolean
  removeControlChars: boolean
  normalizeUnusualWhitespace: boolean
  collapseRepeatedSpaces: boolean
  normalizeLineEndings: boolean
  preserveParagraphBreaks: boolean
  unicodeNfcNormalize: boolean
}

export const DEFAULT_CLEANING_OPTIONS: CleaningOptions = {
  removeZeroWidth: true,
  removeBidiControls: true,
  convertNbsp: true,
  removeSoftHyphens: true,
  removeControlChars: true,
  normalizeUnusualWhitespace: true,
  collapseRepeatedSpaces: true,
  normalizeLineEndings: true,
  preserveParagraphBreaks: true,
  unicodeNfcNormalize: true,
}

/** Maximum number of findings rendered in the Inspector before truncation. */
export const MAX_INSPECTOR_FINDINGS = 500
