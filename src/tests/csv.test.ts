import Papa from 'papaparse'
import { describe, expect, it } from 'vitest'
import { cleanCsv } from '../lib/cleanCsv'

const ZWSP = String.fromCodePoint(0x200b)

describe('cleanCsv', () => {
  it('preserves quoted commas inside a field', () => {
    const input = 'name,note\n"Smith, John","Prefers email"\n"Doe, Jane","Prefers phone"'
    const result = cleanCsv(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const reparsed = Papa.parse<string[]>(result.cleanedCsv)
    expect(reparsed.data).toEqual([
      ['name', 'note'],
      ['Smith, John', 'Prefers email'],
      ['Doe, Jane', 'Prefers phone'],
    ])
  })

  it('cleans cell text without breaking row/column structure', () => {
    const input = `name,city\nhel${ZWSP}lo,London`
    const result = cleanCsv(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const reparsed = Papa.parse<string[]>(result.cleanedCsv)
    expect(reparsed.data).toEqual([
      ['name', 'city'],
      ['hello', 'London'],
    ])
  })

  it('preserves escaped quotes inside quoted fields', () => {
    const input = 'quote\n"She said ""hi"" to me"'
    const result = cleanCsv(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const reparsed = Papa.parse<string[]>(result.cleanedCsv)
    expect(reparsed.data).toEqual([['quote'], ['She said "hi" to me']])
  })
})
