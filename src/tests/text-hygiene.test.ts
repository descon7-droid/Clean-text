import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { cleanText } from '../lib/cleanText'
import type { CleaningOptions } from '../types/cleaning'

/**
 * Runs the product's own cleaning engine over the project's own tracked text
 * (every page/component, lib module, doc, and code comment) and fails if it
 * finds anything it would flag — the same "wordwasher, applied to itself"
 * check used to catch a stray zero-width space that had crept into a doc.
 *
 * Whitespace-collapsing, line-ending rewrites and NFC normalization are
 * deliberately off: those are prose-formatting choices that would corrupt
 * source-code indentation. Only genuinely invisible / stray-encoding
 * characters are in scope.
 */
const SOURCE_SAFE_OPTIONS: CleaningOptions = {
  removeZeroWidth: true,
  removeBidiControls: true,
  convertNbsp: true,
  removeSoftHyphens: true,
  removeControlChars: true,
  normalizeUnusualWhitespace: true,
  collapseRepeatedSpaces: false,
  normalizeLineEndings: false,
  preserveParagraphBreaks: false,
  unicodeNfcNormalize: false,
}

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.md', '.html', '.css', '.json', '.txt', '.xml'])
// src/tests/** is excluded: several fixtures there intentionally embed these
// exact characters as test data.
const EXCLUDE_PATTERNS = [/^src\/tests\//, /package-lock\.json$/]

function trackedTextFiles(): string[] {
  const files = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean)
  return files.filter((f) => TEXT_EXTENSIONS.has(path.extname(f)) && !EXCLUDE_PATTERNS.some((re) => re.test(f)))
}

describe('text hygiene — the site washes its own text', () => {
  const files = trackedTextFiles()

  it('found at least one file to check (the scan itself is not silently empty)', () => {
    expect(files.length).toBeGreaterThan(10)
  })

  it.each(files)('%s has no hidden or stray-encoding characters', (relPath) => {
    const content = readFileSync(path.join(REPO_ROOT, relPath), 'utf-8')
    const result = cleanText(content, SOURCE_SAFE_OPTIONS)
    const flagged = result.findings.filter((f) => f.action === 'removed' || f.action === 'converted')

    if (flagged.length > 0) {
      const detail = flagged.map((f) => `  index ${f.index}: ${f.name} (${f.unicode})`).join('\n')
      expect.fail(`${relPath} contains hidden characters:\n${detail}`)
    }
  })
})
