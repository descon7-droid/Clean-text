import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { cleanDocx } from '../lib/cleanDocx'

const ZWSP = String.fromCodePoint(0x200b)

async function buildFixtureDocx(bodyText: string): Promise<Blob> {
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>',
  )
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
      `<w:body><w:p><w:r><w:t>${bodyText}</w:t></w:r></w:p></w:body>` +
      `</w:document>`,
  )
  return zip.generateAsync({ type: 'blob' })
}

describe('cleanDocx', () => {
  it('cleans text inside <w:t> runs and stays a valid zip/OOXML package', async () => {
    const fixture = await buildFixtureDocx(`Hello${ZWSP}World`)
    const buffer = await fixture.arrayBuffer()

    const result = await cleanDocx(buffer)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.counts.zeroWidthRemoved).toBe(1)

    const rezipped = await JSZip.loadAsync(result.blob)
    expect(rezipped.file('word/document.xml')).not.toBeNull()
    const xml = await rezipped.file('word/document.xml')!.async('string')
    expect(xml).toContain('<w:t>HelloWorld</w:t>')
    expect(xml).not.toContain(ZWSP)
    // Structure around the run is preserved.
    expect(xml).toContain('<w:body>')
    expect(xml).toContain('<w:p>')
  })

  it('reports an error for a file that is not a valid docx', async () => {
    const notADocx = new Blob(['plain text, not a zip'], { type: 'text/plain' })
    const buffer = await notADocx.arrayBuffer()
    const result = await cleanDocx(buffer)
    expect(result.ok).toBe(false)
  })
})
