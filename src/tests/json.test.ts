import { describe, expect, it } from 'vitest'
import { cleanJson } from '../lib/cleanJson'

const ZWSP = String.fromCodePoint(0x200b)

describe('cleanJson', () => {
  it('cleans string values while preserving keys, numbers and structure', () => {
    const input = JSON.stringify({
      name: `hel${ZWSP}lo`,
      count: 5,
      active: true,
      nested: { tag: `wor${ZWSP}ld` },
      list: [`a${ZWSP}b`, 2, null],
    })

    const result = cleanJson(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const parsed = JSON.parse(result.cleanedJson)
    expect(parsed).toEqual({
      name: 'hello',
      count: 5,
      active: true,
      nested: { tag: 'world' },
      list: ['ab', 2, null],
    })
    expect(result.stringsCleaned).toBeGreaterThan(0)
  })

  it('never modifies invalid JSON and reports an error instead', () => {
    const result = cleanJson('{ "name": "hello", }')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBe('This JSON file is not valid and was not modified.')
  })

  it('preserves numbers, booleans and null exactly', () => {
    const input = JSON.stringify({ n: 3.14, flag: false, nothing: null })
    const result = cleanJson(input)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(JSON.parse(result.cleanedJson)).toEqual({ n: 3.14, flag: false, nothing: null })
  })
})
