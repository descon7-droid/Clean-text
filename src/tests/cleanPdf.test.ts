import { describe, expect, it } from 'vitest'
import { extractPageText } from '../lib/cleanPdf'

// Synthetic pdf.js TextItem shapes. Values below are taken directly from a
// real pdf.js dump of a Chromium-printed PDF (see the bug this guards
// against: a soft hyphen inside an unbroken word causes the text run to
// split into two items with ~0 gap between them).
describe('extractPageText — regression: text-run joining', () => {
  it('does not insert a space between runs split with (near) zero gap, e.g. at a soft hyphen', () => {
    const items = [
      { str: 'Hello World Test sub', transform: [1, 0, 0, 1, 5.99999975, 775.5], width: 101.41405876941404 },
      { str: 'tle text and another sentence right here.', transform: [1, 0, 0, 1, 107.41405839941405, 775.5], width: 188.91796120841792 },
    ]
    expect(extractPageText(items)).toBe('Hello World Test subtle text and another sentence right here.')
  })

  it('inserts a space between runs that have a real horizontal gap (e.g. a column or tab)', () => {
    const items = [
      { str: 'Left column', transform: [1, 0, 0, 1, 10, 700], width: 60 },
      { str: 'Right column', transform: [1, 0, 0, 1, 300, 700], width: 60 }, // big gap: 300 - 70 = 230
    ]
    expect(extractPageText(items)).toBe('Left column Right column')
  })

  it('leaves a single, whole-sentence text item untouched (the common case)', () => {
    const items = [{ str: 'Hello World Test subtle text.', transform: [1, 0, 0, 1, 6, 775], width: 290 }]
    expect(extractPageText(items)).toBe('Hello World Test subtle text.')
  })

  it('inserts a newline at hasEOL and preserves multi-line / multi-paragraph structure', () => {
    const items = [
      { str: 'First paragraph line one.', transform: [1, 0, 0, 1, 6, 775.5], width: 100, hasEOL: true },
      { str: 'Second paragraph line one.', transform: [1, 0, 0, 1, 6, 750], width: 100, hasEOL: true },
      { str: 'Second paragraph line two.', transform: [1, 0, 0, 1, 6, 736.5], width: 100, hasEOL: false },
    ]
    expect(extractPageText(items)).toBe(
      'First paragraph line one.\nSecond paragraph line one.\nSecond paragraph line two.',
    )
  })

  it('ignores non-text marked-content items without throwing', () => {
    const items = [
      { type: 'beginMarkedContent', tag: 'Artifact' },
      { str: 'visible text', transform: [1, 0, 0, 1, 6, 775], width: 60 },
    ]
    expect(extractPageText(items)).toBe('visible text')
  })

  it('handles an empty items array', () => {
    expect(extractPageText([])).toBe('')
  })
})
