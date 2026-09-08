/**
 * Unicode character classification tables used by the cleaning engine.
 * All ranges are deliberately narrow: the goal is to catch known invisible
 * / formatting artefacts, never to strip ordinary non-English text, emoji,
 * punctuation or accents.
 */

export const ZERO_WIDTH_NAMES: Record<number, string> = {
  0x200b: 'Zero Width Space',
  0x200c: 'Zero Width Non-Joiner',
  0x200d: 'Zero Width Joiner',
  0x2060: 'Word Joiner',
  0xfeff: 'Zero Width No-Break Space (BOM)',
  0x180e: 'Mongolian Vowel Separator',
}

/** Zero-width joiner / non-joiner: only these two need context-aware handling. */
export const JOINER_CODEPOINTS = new Set([0x200c, 0x200d])

export const BIDI_NAMES: Record<number, string> = {
  0x200e: 'Left-to-Right Mark',
  0x200f: 'Right-to-Left Mark',
  0x202a: 'Left-to-Right Embedding',
  0x202b: 'Right-to-Left Embedding',
  0x202c: 'Pop Directional Formatting',
  0x202d: 'Left-to-Right Override',
  0x202e: 'Right-to-Left Override',
  0x2066: 'Left-to-Right Isolate',
  0x2067: 'Right-to-Left Isolate',
  0x2068: 'First Strong Isolate',
  0x2069: 'Pop Directional Isolate',
}

export const NBSP_CODEPOINT = 0x00a0
export const SOFT_HYPHEN_CODEPOINT = 0x00ad

export const UNUSUAL_SPACE_NAMES: Record<number, string> = {
  0x1680: 'Ogham Space Mark',
  0x2000: 'En Quad',
  0x2001: 'Em Quad',
  0x2002: 'En Space',
  0x2003: 'Em Space',
  0x2004: 'Three-Per-Em Space',
  0x2005: 'Four-Per-Em Space',
  0x2006: 'Six-Per-Em Space',
  0x2007: 'Figure Space',
  0x2008: 'Punctuation Space',
  0x2009: 'Thin Space',
  0x200a: 'Hair Space',
  0x202f: 'Narrow No-Break Space',
  0x205f: 'Medium Mathematical Space',
  0x3000: 'Ideographic Space',
}

/** Code points meaningfully joined by ZWJ (e.g. family/profession emoji sequences). */
function isEmojiRelated(cp: number): boolean {
  return (
    (cp >= 0x1f000 && cp <= 0x1ffff) || // emoji & pictograph planes
    (cp >= 0x2600 && cp <= 0x27bf) || // misc symbols & dingbats
    (cp >= 0x1f1e6 && cp <= 0x1f1ff) || // regional indicators
    cp === 0xfe0f || // variation selector-16 (emoji presentation)
    cp === 0x2764 // heavy black heart, common in ZWJ sequences
  )
}

/** Scripts where ZWJ/ZWNJ affect glyph shaping (Arabic, Persian, Indic, etc). */
function isComplexShapingScript(cp: number): boolean {
  return (
    (cp >= 0x0600 && cp <= 0x06ff) || // Arabic
    (cp >= 0x0750 && cp <= 0x077f) || // Arabic Supplement
    (cp >= 0x08a0 && cp <= 0x08ff) || // Arabic Extended-A
    (cp >= 0xfb50 && cp <= 0xfdff) || // Arabic Presentation Forms-A
    (cp >= 0xfe70 && cp <= 0xfeff) || // Arabic Presentation Forms-B
    (cp >= 0x0900 && cp <= 0x097f) || // Devanagari
    (cp >= 0x0980 && cp <= 0x09ff) || // Bengali
    (cp >= 0x0a00 && cp <= 0x0a7f) || // Gurmukhi
    (cp >= 0x0a80 && cp <= 0x0aff) || // Gujarati
    (cp >= 0x0b00 && cp <= 0x0b7f) || // Oriya
    (cp >= 0x0b80 && cp <= 0x0bff) || // Tamil
    (cp >= 0x0c00 && cp <= 0x0c7f) || // Telugu
    (cp >= 0x0c80 && cp <= 0x0cff) || // Kannada
    (cp >= 0x0d00 && cp <= 0x0d7f) || // Malayalam
    (cp >= 0x0e00 && cp <= 0x0e7f) || // Thai
    (cp >= 0x1000 && cp <= 0x109f) // Myanmar
  )
}

/**
 * Whether a ZWJ/ZWNJ at this point is likely required for correct rendering
 * (emoji sequence or complex-script shaping) and should be preserved even
 * when zero-width removal is enabled.
 */
export function isJoinerContextSignificant(prevCp: number | undefined, nextCp: number | undefined): boolean {
  const relevant = (cp: number | undefined) =>
    cp !== undefined && (isEmojiRelated(cp) || isComplexShapingScript(cp))
  return relevant(prevCp) || relevant(nextCp)
}

const C0_ALLOWED = new Set([0x09, 0x0a, 0x0d]) // tab, LF, CR

export function isControlChar(cp: number): boolean {
  if (cp <= 0x1f) return !C0_ALLOWED.has(cp)
  if (cp === 0x7f) return true
  if (cp >= 0x80 && cp <= 0x9f) return true
  return false
}

export function formatCodePoint(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`
}

const CONTROL_NAMES: Record<number, string> = {
  0x00: 'Null',
  0x01: 'Start of Heading',
  0x02: 'Start of Text',
  0x03: 'End of Text',
  0x04: 'End of Transmission',
  0x05: 'Enquiry',
  0x06: 'Acknowledge',
  0x07: 'Bell',
  0x08: 'Backspace',
  0x0b: 'Line Tabulation',
  0x0c: 'Form Feed',
  0x0e: 'Shift Out',
  0x0f: 'Shift In',
  0x1b: 'Escape',
  0x7f: 'Delete',
}

export function getControlName(cp: number): string {
  return CONTROL_NAMES[cp] ?? `Control Character (${formatCodePoint(cp)})`
}
