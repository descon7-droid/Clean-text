import { describe, expect, it } from 'vitest'
import { cleanHtml } from '../lib/cleanHtml'

const ZWSP = String.fromCodePoint(0x200b)

describe('cleanHtml', () => {
  it('preserves tags and structure while cleaning visible text', () => {
    const input = `<p>hel<b>lo</b> ${ZWSP}world</p>`
    const result = cleanHtml(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.cleanedHtml).toContain('<b>lo</b>')
    expect(result.cleanedHtml).not.toContain(ZWSP)
    expect(result.counts.zeroWidthRemoved).toBe(1)
  })

  it('never touches content inside script or style tags', () => {
    const input = `<script>const x = "${ZWSP}keep";</script><style>.a::before{content:"${ZWSP}"}</style><p>hi</p>`
    const result = cleanHtml(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.cleanedHtml).toContain(`"${ZWSP}keep"`)
    expect(result.counts.zeroWidthRemoved).toBe(0)
  })

  it('preserves links, attributes and list structure', () => {
    const input = '<ul><li><a href="https://example.com">Example</a></li><li>Second</li></ul>'
    const result = cleanHtml(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.cleanedHtml).toContain('href="https://example.com"')
    expect(result.cleanedHtml).toContain('<li>')
  })
})
