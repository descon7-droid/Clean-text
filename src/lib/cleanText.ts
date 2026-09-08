import type { CleanCounts, CleanResult, CleaningOptions, Finding } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import {
  BIDI_NAMES,
  JOINER_CODEPOINTS,
  NBSP_CODEPOINT,
  SOFT_HYPHEN_CODEPOINT,
  UNUSUAL_SPACE_NAMES,
  ZERO_WIDTH_NAMES,
  formatCodePoint,
  getControlName,
  isControlChar,
  isJoinerContextSignificant,
} from './unicode'

function emptyCounts(): CleanCounts {
  return {
    zeroWidthRemoved: 0,
    bidiRemoved: 0,
    controlRemoved: 0,
    nbspConverted: 0,
    softHyphenRemoved: 0,
    unusualWhitespaceNormalized: 0,
    whitespaceCollapsed: 0,
    unicodeNormalized: 0,
  }
}

/** Exposed for cleaners that aggregate results across many strings (JSON, CSV, HTML, DOCX). */
export function createEmptyCounts(): CleanCounts {
  return emptyCounts()
}

export function mergeCounts(a: CleanCounts, b: CleanCounts): CleanCounts {
  return {
    zeroWidthRemoved: a.zeroWidthRemoved + b.zeroWidthRemoved,
    bidiRemoved: a.bidiRemoved + b.bidiRemoved,
    controlRemoved: a.controlRemoved + b.controlRemoved,
    nbspConverted: a.nbspConverted + b.nbspConverted,
    softHyphenRemoved: a.softHyphenRemoved + b.softHyphenRemoved,
    unusualWhitespaceNormalized: a.unusualWhitespaceNormalized + b.unusualWhitespaceNormalized,
    whitespaceCollapsed: a.whitespaceCollapsed + b.whitespaceCollapsed,
    unicodeNormalized: a.unicodeNormalized + b.unicodeNormalized,
  }
}

/**
 * Deterministic, single-pass Unicode artefact cleaner.
 * Never touches ordinary letters, punctuation, accents, emoji or CJK text —
 * it only acts on the specific code points listed in unicode.ts.
 */
export function cleanText(input: string, options: CleaningOptions = DEFAULT_CLEANING_OPTIONS): CleanResult {
  const counts = emptyCounts()
  const findings: Finding[] = []
  let out = ''

  const len = input.length
  let i = 0
  while (i < len) {
    const cp = input.codePointAt(i) as number
    const charWidth = cp > 0xffff ? 2 : 1
    const char = input.slice(i, i + charWidth)

    // CRLF / CR line-ending normalisation, handled inline to preserve indices.
    if (options.normalizeLineEndings && cp === 0x0d) {
      const next = input.codePointAt(i + 1)
      out += '\n'
      i += next === 0x0a ? 2 : 1
      continue
    }

    if (ZERO_WIDTH_NAMES[cp] !== undefined) {
      const isJoiner = JOINER_CODEPOINTS.has(cp)
      const prevCp = i > 0 ? input.codePointAt(previousIndex(input, i)) : undefined
      const nextCp = input.codePointAt(i + charWidth)
      const preserveJoiner = isJoiner && isJoinerContextSignificant(prevCp, nextCp)

      if (options.removeZeroWidth && !preserveJoiner) {
        counts.zeroWidthRemoved++
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: ZERO_WIDTH_NAMES[cp],
          category: 'zero-width',
          action: 'removed',
        })
      } else {
        out += char
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: ZERO_WIDTH_NAMES[cp],
          category: 'zero-width',
          action: 'preserved',
        })
      }
      i += charWidth
      continue
    }

    if (BIDI_NAMES[cp] !== undefined) {
      if (options.removeBidiControls) {
        counts.bidiRemoved++
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: BIDI_NAMES[cp],
          category: 'bidi',
          action: 'removed',
        })
      } else {
        out += char
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: BIDI_NAMES[cp],
          category: 'bidi',
          action: 'preserved',
        })
      }
      i += charWidth
      continue
    }

    if (cp === NBSP_CODEPOINT) {
      if (options.convertNbsp) {
        counts.nbspConverted++
        out += ' '
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: 'No-Break Space',
          category: 'whitespace',
          action: 'converted',
        })
      } else {
        out += char
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: 'No-Break Space',
          category: 'whitespace',
          action: 'preserved',
        })
      }
      i += charWidth
      continue
    }

    if (cp === SOFT_HYPHEN_CODEPOINT) {
      if (options.removeSoftHyphens) {
        counts.softHyphenRemoved++
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: 'Soft Hyphen',
          category: 'formatting',
          action: 'removed',
        })
      } else {
        out += char
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: 'Soft Hyphen',
          category: 'formatting',
          action: 'preserved',
        })
      }
      i += charWidth
      continue
    }

    if (UNUSUAL_SPACE_NAMES[cp] !== undefined) {
      if (options.normalizeUnusualWhitespace) {
        counts.unusualWhitespaceNormalized++
        out += ' '
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: UNUSUAL_SPACE_NAMES[cp],
          category: 'whitespace',
          action: 'converted',
        })
      } else {
        out += char
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: UNUSUAL_SPACE_NAMES[cp],
          category: 'whitespace',
          action: 'preserved',
        })
      }
      i += charWidth
      continue
    }

    if (isControlChar(cp)) {
      if (options.removeControlChars) {
        counts.controlRemoved++
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: getControlName(cp),
          category: 'control',
          action: 'removed',
        })
      } else {
        out += char
        findings.push({
          index: i,
          codePoint: cp,
          unicode: formatCodePoint(cp),
          name: getControlName(cp),
          category: 'control',
          action: 'preserved',
        })
      }
      i += charWidth
      continue
    }

    out += char
    i += charWidth
  }

  if (options.collapseRepeatedSpaces || options.preserveParagraphBreaks) {
    out = collapseWhitespace(out, options, counts)
  }

  if (options.unicodeNfcNormalize) {
    const normalized = out.normalize('NFC')
    if (normalized !== out) {
      counts.unicodeNormalized = countCodePointDiff(out, normalized)
      out = normalized
    }
  }

  return {
    cleanedText: out,
    originalLength: Array.from(input).length,
    cleanedLength: Array.from(out).length,
    counts,
    findings,
  }
}

/** Index of the character immediately before position `i`, accounting for surrogate pairs. */
function previousIndex(input: string, i: number): number {
  if (i >= 2) {
    const maybeLow = input.charCodeAt(i - 1)
    if (maybeLow >= 0xdc00 && maybeLow <= 0xdfff) return i - 2
  }
  return Math.max(0, i - 1)
}

function collapseWhitespace(text: string, options: CleaningOptions, counts: CleanCounts): string {
  let result = text

  // Strip trailing spaces/tabs at the end of each line.
  result = result.replace(/[ \t]+$/gm, () => {
    counts.whitespaceCollapsed++
    return ''
  })

  if (options.collapseRepeatedSpaces) {
    result = result.replace(/ {2,}/g, () => {
      counts.whitespaceCollapsed++
      return ' '
    })
  }

  if (options.preserveParagraphBreaks) {
    // Collapse 3+ newlines down to a single blank line (paragraph break).
    result = result.replace(/\n{3,}/g, () => {
      counts.whitespaceCollapsed++
      return '\n\n'
    })
  } else {
    result = result.replace(/\n{2,}/g, () => {
      counts.whitespaceCollapsed++
      return '\n'
    })
  }

  return result
}

function countCodePointDiff(before: string, after: string): number {
  const a = Array.from(before)
  const b = Array.from(after)
  const max = Math.max(a.length, b.length)
  let diff = 0
  for (let idx = 0; idx < max; idx++) {
    if (a[idx] !== b[idx]) diff++
  }
  return diff || 1
}
