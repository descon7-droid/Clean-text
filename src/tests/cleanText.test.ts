import { describe, expect, it } from 'vitest'
import { cleanText } from '../lib/cleanText'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'

const ZWSP = String.fromCodePoint(0x200b)
const ZWJ = String.fromCodePoint(0x200d)
const BOM = String.fromCodePoint(0xfeff)
const NBSP = String.fromCodePoint(0x00a0)
const SOFT_HYPHEN = String.fromCodePoint(0x00ad)
const RTL_OVERRIDE = String.fromCodePoint(0x202e)
const IDEOGRAPHIC_SPACE = String.fromCodePoint(0x3000)
const BELL = String.fromCodePoint(0x07)
const WOMAN = String.fromCodePoint(0x1f469)
const LAPTOP = String.fromCodePoint(0x1f4bb)
const PARTY_POPPER = String.fromCodePoint(0x1f389)
const ROCKET = String.fromCodePoint(0x1f680)

describe('cleanText — zero-width characters', () => {
  it('removes a zero-width space', () => {
    const input = `hel${ZWSP}lo`
    const result = cleanText(input)
    expect(result.cleanedText).toBe('hello')
    expect(result.counts.zeroWidthRemoved).toBe(1)
  })

  it('removes BOM / zero-width no-break space', () => {
    const result = cleanText(`${BOM}Hello`)
    expect(result.cleanedText).toBe('Hello')
    expect(result.counts.zeroWidthRemoved).toBe(1)
  })
})

describe('cleanText — non-breaking space', () => {
  it('converts NBSP to an ordinary space', () => {
    const result = cleanText(`a${NBSP}b`)
    expect(result.cleanedText).toBe('a b')
    expect(result.counts.nbspConverted).toBe(1)
  })
})

describe('cleanText — soft hyphen', () => {
  it('removes soft hyphens', () => {
    const result = cleanText(`sub${SOFT_HYPHEN}tle`)
    expect(result.cleanedText).toBe('subtle')
    expect(result.counts.softHyphenRemoved).toBe(1)
  })
})

describe('cleanText — bidi controls', () => {
  it('removes a right-to-left override', () => {
    const result = cleanText(`safe${RTL_OVERRIDE}text`)
    expect(result.cleanedText).toBe('safetext')
    expect(result.counts.bidiRemoved).toBe(1)
    expect(result.findings.some((f) => f.unicode === 'U+202E' && f.action === 'removed')).toBe(true)
  })

  it('leaves bidi controls in place when the option is disabled', () => {
    const options = { ...DEFAULT_CLEANING_OPTIONS, removeBidiControls: false }
    const input = `safe${RTL_OVERRIDE}text`
    const result = cleanText(input, options)
    expect(result.cleanedText).toBe(input)
    expect(result.counts.bidiRemoved).toBe(0)
  })
})

describe('cleanText — emoji ZWJ sequences', () => {
  it('preserves the zero-width joiner in an emoji sequence', () => {
    const womanTechnologist = `${WOMAN}${ZWJ}${LAPTOP}`
    const result = cleanText(womanTechnologist)
    expect(result.cleanedText).toBe(womanTechnologist)
    expect(result.counts.zeroWidthRemoved).toBe(0)
  })

  it('still removes a zero-width joiner with no emoji or complex-script context', () => {
    const result = cleanText(`a${ZWJ}b`)
    expect(result.cleanedText).toBe('ab')
    expect(result.counts.zeroWidthRemoved).toBe(1)
  })
})

describe('cleanText — control characters', () => {
  it('removes stray control characters but keeps tabs and newlines', () => {
    const result = cleanText(`a${BELL}b\tc\nd`)
    expect(result.cleanedText).toBe('ab\tc\nd')
    expect(result.counts.controlRemoved).toBe(1)
  })
})

describe('cleanText — whitespace normalisation', () => {
  it('normalises unusual space characters', () => {
    const result = cleanText(`a${IDEOGRAPHIC_SPACE}b`)
    expect(result.cleanedText).toBe('a b')
    expect(result.counts.unusualWhitespaceNormalized).toBe(1)
  })

  it('collapses repeated spaces', () => {
    const result = cleanText('a     b')
    expect(result.cleanedText).toBe('a b')
    expect(result.counts.whitespaceCollapsed).toBeGreaterThan(0)
  })

  it('normalises CRLF and lone CR to LF', () => {
    const result = cleanText('a\r\nb\rc')
    expect(result.cleanedText).toBe('a\nb\nc')
  })

  it('collapses excessive blank lines while preserving a single paragraph break', () => {
    const result = cleanText('para one\n\n\n\n\npara two')
    expect(result.cleanedText).toBe('para one\n\npara two')
  })
})

describe('cleanText — conservative behaviour', () => {
  it('never touches ordinary accented and non-English text', () => {
    const input = 'Café — déjà vu. こんにちは. Привет. مرحبا'
    const result = cleanText(input)
    expect(result.cleanedText).toBe(input)
  })

  it('never strips emoji', () => {
    const input = `Great work ${PARTY_POPPER}${ROCKET}`
    const result = cleanText(input)
    expect(result.cleanedText).toBe(input)
  })

  it('leaves mathematical symbols untouched', () => {
    const input = '∀x ∈ ℝ, x² ≥ 0'
    const result = cleanText(input)
    expect(result.cleanedText).toBe(input)
  })
})
