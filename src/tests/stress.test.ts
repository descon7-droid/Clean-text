import { describe, expect, it } from 'vitest'
import { cleanText } from '../lib/cleanText'
import { cleanJson } from '../lib/cleanJson'
import { cleanCsv } from '../lib/cleanCsv'
import { cleanHtml } from '../lib/cleanHtml'
import { DEFAULT_CLEANING_OPTIONS, MAX_INSPECTOR_FINDINGS } from '../types/cleaning'

const ZWSP = String.fromCodePoint(0x200b)
const NBSP = String.fromCodePoint(0x00a0)
const COMBINING_ACUTE = String.fromCodePoint(0x0301)
const RLO = String.fromCodePoint(0x202e)
const PDF_CHAR = String.fromCodePoint(0x202c)

describe('stress — large input', () => {
  it('handles a very large input (500k chars, 10k scattered artefacts) quickly and correctly', () => {
    const chunk = `word${ZWSP}`.repeat(10_000) // 10,000 zero-width spaces scattered through ~50k chars
    const padding = 'the quick brown fox jumps over the lazy dog. '.repeat(10_000) // ~460k chars of ordinary text
    const input = chunk + padding

    const start = performance.now()
    const result = cleanText(input)
    const elapsedMs = performance.now() - start

    expect(result.counts.zeroWidthRemoved).toBe(10_000)
    expect(result.cleanedText).not.toContain(ZWSP)
    expect(result.findings.length).toBe(10_000)
    // Generous ceiling — this is about correctness holding up at scale, not micro-benchmarking.
    expect(elapsedMs).toBeLessThan(2000)
  })

  it('produces more findings than the Inspector display cap, and the cap constant is sane', () => {
    const input = ZWSP.repeat(MAX_INSPECTOR_FINDINGS + 250)
    const result = cleanText(input)
    expect(result.findings.length).toBe(MAX_INSPECTOR_FINDINGS + 250)
    expect(result.counts.zeroWidthRemoved).toBe(MAX_INSPECTOR_FINDINGS + 250)
    expect(result.cleanedText).toBe('')
  })

  it('does not corrupt surrogate pairs when scanning a long run of emoji next to artefacts', () => {
    const familyEmoji = '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}' // family: man, woman, girl, boy (ZWJ-joined)
    const input = Array.from({ length: 500 }, () => `${familyEmoji}${ZWSP}`).join('')
    const result = cleanText(input)
    // Every ZWJ inside the family sequence must be preserved (emoji context); only the
    // trailing stray ZWSP per repetition should be removed.
    expect(result.counts.zeroWidthRemoved).toBe(500)
    expect(result.cleanedText).toBe(familyEmoji.repeat(500))
    // No lone surrogate halves anywhere in the output.
    expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(result.cleanedText)).toBe(
      false,
    )
  })
})

describe('stress — adversarial unicode', () => {
  it('never flags combining diacritics as artefacts (with NFC normalisation off, to isolate the claim)', () => {
    const stacked = 'e' + COMBINING_ACUTE.repeat(30)
    const options = { ...DEFAULT_CLEANING_OPTIONS, unicodeNfcNormalize: false }
    const result = cleanText(`word ${stacked} word`, options)
    expect(result.cleanedText).toBe(`word ${stacked} word`)
    expect(result.counts.zeroWidthRemoved).toBe(0)
    expect(result.findings).toEqual([])
  })

  it('NFC-composes a stacked-diacritic base pair by default without touching the rest (documented behaviour, not an artefact)', () => {
    const stacked = 'e' + COMBINING_ACUTE.repeat(30)
    const result = cleanText(`word ${stacked} word`)
    expect(result.cleanedText).toBe(`word ${stacked.normalize('NFC')} word`)
    expect(result.counts.unicodeNormalized).toBeGreaterThan(0)
  })

  it('removes real bidi override/pop pairs embedded naturally in mixed-direction text', () => {
    const input = `Invoice total: ${RLO}9002$${PDF_CHAR} due Friday`
    const result = cleanText(input)
    expect(result.cleanedText).toBe('Invoice total: 9002$ due Friday')
    expect(result.counts.bidiRemoved).toBe(2)
  })

  it('handles a string that is entirely artefacts with no ordinary characters', () => {
    const input = ZWSP + NBSP + RLO + PDF_CHAR
    const result = cleanText(input)
    // NBSP converts to an ordinary space, but a trailing space with nothing after it
    // is itself trimmed by "collapse repeated spaces" — same rule that trims trailing
    // spaces at the end of any line, applied consistently here. Net result: empty.
    expect(result.cleanedText).toBe('')
    expect(result.counts.zeroWidthRemoved).toBe(1)
    expect(result.counts.nbspConverted).toBe(1)
    expect(result.counts.bidiRemoved).toBe(2)
    expect(result.counts.whitespaceCollapsed).toBeGreaterThan(0)
  })

  it('handles an empty string without throwing', () => {
    const result = cleanText('')
    expect(result.cleanedText).toBe('')
    expect(result.findings).toEqual([])
  })
})

describe('stress — pathological JSON', () => {
  it('survives deep nesting (500 levels) without stack overflow, cleaning every leaf', () => {
    let value: unknown = `leaf${ZWSP}value`
    for (let i = 0; i < 500; i++) {
      value = { nested: value }
    }
    const input = JSON.stringify(value)

    expect(() => cleanJson(input)).not.toThrow()
    const result = cleanJson(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.cleanedJson).not.toContain(ZWSP)
    expect(result.stringsCleaned).toBe(1)
  })

  it('cleans every string across a wide array (10k entries) without dropping any', () => {
    const arr = Array.from({ length: 10_000 }, (_, i) => `item-${i}${ZWSP}`)
    const input = JSON.stringify(arr)
    const result = cleanJson(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const parsed = JSON.parse(result.cleanedJson) as string[]
    expect(parsed).toHaveLength(10_000)
    expect(parsed[0]).toBe('item-0')
    expect(parsed[9999]).toBe('item-9999')
    expect(result.cleanedJson).not.toContain(ZWSP)
  })

  it('never modifies JSON with duplicate keys unpredictably — last-value-wins like JSON.parse itself', () => {
    const input = `{"a": "one${ZWSP}", "a": "two${ZWSP}"}`
    const result = cleanJson(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(JSON.parse(result.cleanedJson)).toEqual({ a: 'two' })
  })
})

describe('stress — pathological CSV', () => {
  it('preserves a very wide row (200 columns) and many rows (2000)', () => {
    const header = Array.from({ length: 200 }, (_, i) => `col${i}`).join(',')
    const row = Array.from({ length: 200 }, (_, i) => `v${i}${i === 5 ? ZWSP : ''}`).join(',')
    const input = [header, ...Array.from({ length: 2000 }, () => row)].join('\n')

    const result = cleanCsv(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.cleanedCsv).not.toContain(ZWSP)
    const lines = result.cleanedCsv.trim().split('\n')
    expect(lines.length).toBe(2001) // header + 2000 rows
  })

  it('preserves a multiline quoted field containing embedded newlines and commas', () => {
    const input = 'name,note\n"Smith, John","Line one\nLine two, with a comma"'
    const result = cleanCsv(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.cleanedCsv).toContain('Line one\nLine two, with a comma')
  })

  it('handles a field containing only artefacts without breaking column count', () => {
    const input = `a,b,c\n1,${ZWSP},3`
    const result = cleanCsv(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const lines = result.cleanedCsv.trim().split('\n')
    expect(lines[1].split(',')).toHaveLength(3)
  })
})

describe('stress — pathological HTML', () => {
  it('handles deeply nested elements (300 levels) without stack overflow', () => {
    const open = '<div>'.repeat(300)
    const close = '</div>'.repeat(300)
    const input = `${open}hel${ZWSP}lo${close}`
    expect(() => cleanHtml(input)).not.toThrow()
    const result = cleanHtml(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.cleanedHtml).not.toContain(ZWSP)
    expect(result.cleanedHtml).toContain('hello')
  })

  it('handles a large number of sibling elements (5000 <li>s)', () => {
    const items = Array.from({ length: 5000 }, (_, i) => `<li>item ${i}${ZWSP}</li>`).join('')
    const input = `<ul>${items}</ul>`
    const result = cleanHtml(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.cleanedHtml).not.toContain(ZWSP)
    expect((result.cleanedHtml.match(/<li>/g) ?? []).length).toBe(5000)
  })

  it('does not execute or leak <script> content while still parsing the rest of the document', () => {
    const input = `<script>document.title = 'pwned${ZWSP}';</script><p>safe${ZWSP} text</p>`
    const result = cleanHtml(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // Script content is preserved verbatim (never touched, never executed by DOMParser).
    expect(result.cleanedHtml).toContain(`'pwned${ZWSP}'`)
    // Ordinary text content is still cleaned.
    expect(result.cleanedHtml).toContain('safe text')
  })
})
