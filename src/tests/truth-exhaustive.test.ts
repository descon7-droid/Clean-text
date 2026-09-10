import { describe, expect, it } from 'vitest'
import { cleanText } from '../lib/cleanText'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import {
  BIDI_NAMES,
  JOINER_CODEPOINTS,
  NBSP_CODEPOINT,
  SOFT_HYPHEN_CODEPOINT,
  UNUSUAL_SPACE_NAMES,
  ZERO_WIDTH_NAMES,
  isControlChar,
} from '../lib/unicode'

/**
 * This suite does not sample a few representative characters — it walks
 * every single code point the product claims to detect, straight from the
 * source-of-truth tables in unicode.ts, and asserts cleanText() actually
 * removes/converts/preserves each one exactly as documented. If a claim in
 * the UI ("removes zero-width space", "removes bidi controls", etc.) isn't
 * backed by one of these entries actually being wired up, this fails.
 */

describe('truth test — every zero-width character is handled', () => {
  const nonJoinerEntries = Object.entries(ZERO_WIDTH_NAMES).filter(([cp]) => !JOINER_CODEPOINTS.has(Number(cp)))

  it.each(nonJoinerEntries)('removes %s (%s) with no surrounding context', (cpStr, name) => {
    const cp = Number(cpStr)
    const char = String.fromCodePoint(cp)
    const result = cleanText(`before${char}after`)
    expect(result.cleanedText, `${name} (U+${cp.toString(16)}) should be removed`).toBe('beforeafter')
    expect(result.counts.zeroWidthRemoved).toBe(1)
    expect(result.findings[0].action).toBe('removed')
  })

  it.each([...JOINER_CODEPOINTS].map((cp) => [cp, ZERO_WIDTH_NAMES[cp]]))(
    'removes joiner U+%s (%s) when NOT adjacent to emoji or complex script',
    (cp, name) => {
      const char = String.fromCodePoint(Number(cp))
      const result = cleanText(`plain${char}text`)
      expect(result.cleanedText, `${name} with no relevant context should be removed`).toBe('plaintext')
      expect(result.counts.zeroWidthRemoved).toBe(1)
    },
  )

  it('preserves ZWJ between two emoji (family sequence)', () => {
    const zwj = String.fromCodePoint(0x200d)
    const input = `\u{1F468}${zwj}\u{1F469}${zwj}\u{1F467}` // man+ZWJ+woman+ZWJ+girl
    const result = cleanText(input)
    expect(result.cleanedText).toBe(input)
    expect(result.counts.zeroWidthRemoved).toBe(0)
  })

  it('preserves ZWNJ between Devanagari conjunct characters', () => {
    const zwnj = String.fromCodePoint(0x200c)
    const input = `क${zwnj}ष` // KA + ZWNJ + SSA (Devanagari)
    const result = cleanText(input)
    expect(result.cleanedText).toBe(input)
    expect(result.counts.zeroWidthRemoved).toBe(0)
  })

  it('preserves ZWNJ between Arabic characters', () => {
    const zwnj = String.fromCodePoint(0x200c)
    const input = `م${zwnj}ن` // Arabic meem + ZWNJ + noon
    const result = cleanText(input)
    expect(result.cleanedText).toBe(input)
    expect(result.counts.zeroWidthRemoved).toBe(0)
  })
})

describe('truth test — every bidi control character is handled', () => {
  it.each(Object.entries(BIDI_NAMES))('removes %s (%s)', (cpStr, name) => {
    const cp = Number(cpStr)
    const char = String.fromCodePoint(cp)
    const result = cleanText(`before${char}after`)
    expect(result.cleanedText, `${name} (U+${cp.toString(16)}) should be removed`).toBe('beforeafter')
    expect(result.counts.bidiRemoved).toBe(1)
    expect(result.findings[0].category).toBe('bidi')
  })

  it('confirms exactly 11 bidi control characters are recognised (the full Unicode set)', () => {
    expect(Object.keys(BIDI_NAMES)).toHaveLength(11)
  })
})

describe('truth test — NBSP and soft hyphen', () => {
  it('converts NBSP to an ordinary space', () => {
    const nbsp = String.fromCodePoint(NBSP_CODEPOINT)
    const result = cleanText(`word${nbsp}word`)
    expect(result.cleanedText).toBe('word word')
    expect(result.counts.nbspConverted).toBe(1)
  })

  it('removes soft hyphen', () => {
    const softHyphen = String.fromCodePoint(SOFT_HYPHEN_CODEPOINT)
    const result = cleanText(`sub${softHyphen}tle`)
    expect(result.cleanedText).toBe('subtle')
    expect(result.counts.softHyphenRemoved).toBe(1)
  })
})

describe('truth test — every unusual whitespace character is handled', () => {
  it.each(Object.entries(UNUSUAL_SPACE_NAMES))('normalises %s (%s) to an ordinary space', (cpStr, name) => {
    const cp = Number(cpStr)
    const char = String.fromCodePoint(cp)
    const result = cleanText(`word${char}word`)
    expect(result.cleanedText, `${name} (U+${cp.toString(16)}) should become a plain space`).toBe('word word')
    expect(result.counts.unusualWhitespaceNormalized).toBe(1)
  })

  it('confirms exactly 15 unusual whitespace characters are recognised', () => {
    expect(Object.keys(UNUSUAL_SPACE_NAMES)).toHaveLength(15)
  })
})

describe('truth test — every C0/C1 control character is handled, tab/LF/CR are not', () => {
  const c0ToRemove = Array.from({ length: 0x20 }, (_, i) => i).filter((cp) => ![0x09, 0x0a, 0x0d].includes(cp))
  const c1ToRemove = Array.from({ length: 0x20 }, (_, i) => 0x80 + i)
  const allControlsToRemove = [...c0ToRemove, 0x7f, ...c1ToRemove]

  it(`removes all ${allControlsToRemove.length} non-whitespace C0/C1 control characters individually`, () => {
    for (const cp of allControlsToRemove) {
      expect(isControlChar(cp), `U+${cp.toString(16).padStart(4, '0')} should be classified as a control char`).toBe(
        true,
      )
      const char = String.fromCodePoint(cp)
      const result = cleanText(`a${char}b`)
      expect(result.cleanedText, `U+${cp.toString(16).padStart(4, '0')} should be removed`).toBe('ab')
      expect(result.counts.controlRemoved).toBe(1)
    }
  })

  it('preserves tab, line feed and carriage return (never flagged as control chars)', () => {
    expect(isControlChar(0x09)).toBe(false)
    expect(isControlChar(0x0a)).toBe(false)
    expect(isControlChar(0x0d)).toBe(false)
    const result = cleanText('a\tb\nc', { ...DEFAULT_CLEANING_OPTIONS, normalizeLineEndings: false })
    expect(result.cleanedText).toBe('a\tb\nc')
    expect(result.counts.controlRemoved).toBe(0)
  })
})

describe('truth test — conservative-by-design claims (things it must NOT touch)', () => {
  it('never strips ordinary accented Latin text', () => {
    const input = 'café, naïve, déjà vu, façade, Zürich'
    expect(cleanText(input).cleanedText).toBe(input)
  })

  it('never strips CJK text', () => {
    const input = '你好世界 こんにちは 안녕하세요'
    expect(cleanText(input).cleanedText).toBe(input)
  })

  it('never strips emoji, including multi-codepoint sequences', () => {
    const input = '🎉🚀👍🏽🏳️‍🌈'
    expect(cleanText(input).cleanedText).toBe(input)
  })

  it('never strips mathematical / scientific symbols', () => {
    const input = '∀x∈ℝ, ∃y: x²+y²=1, ∇·E=ρ/ε₀'
    expect(cleanText(input).cleanedText).toBe(input)
  })

  it('never strips ordinary curly quotes / punctuation', () => {
    const input = '“Hello,” she said — it’s a test… (really!)'
    expect(cleanText(input).cleanedText).toBe(input)
  })

  it('never modifies text with none of the targeted artefacts at all', () => {
    const input = 'The quick brown fox jumps over the lazy dog.'
    const result = cleanText(input)
    expect(result.cleanedText).toBe(input)
    expect(result.findings).toEqual([])
    expect(Object.values(result.counts).every((v) => v === 0)).toBe(true)
  })
})
