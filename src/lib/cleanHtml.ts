import type { CleanCounts, CleaningOptions, Finding } from '../types/cleaning'
import { DEFAULT_CLEANING_OPTIONS } from '../types/cleaning'
import { cleanText, createEmptyCounts, mergeCounts } from './cleanText'

export interface HtmlCleanSuccess {
  ok: true
  cleanedHtml: string
  counts: CleanCounts
  findings: Finding[]
}

export interface HtmlCleanFailure {
  ok: false
  error: string
}

export type HtmlCleanResult = HtmlCleanSuccess | HtmlCleanFailure

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE'])

/**
 * Parses HTML with DOMParser (never executed — parseFromString produces a
 * detached, script-inert document) and cleans only text node content.
 * Tags, attributes, links and structure are preserved untouched. Content
 * inside <script>/<style> is never touched; content inside <pre>/<code>
 * keeps its whitespace formatting even while artefacts are still removed.
 */
export function cleanHtml(input: string, options: CleaningOptions = DEFAULT_CLEANING_OPTIONS): HtmlCleanResult {
  let doc: Document
  try {
    doc = new DOMParser().parseFromString(input, 'text/html')
  } catch {
    return { ok: false, error: 'This HTML file could not be parsed and was not modified.' }
  }

  const root = doc.body ?? doc.documentElement
  if (!root) {
    return { ok: false, error: 'This HTML file could not be parsed and was not modified.' }
  }

  let counts = createEmptyCounts()
  const findings: Finding[] = []

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node = walker.nextNode()
  while (node) {
    textNodes.push(node as Text)
    node = walker.nextNode()
  }

  for (const textNode of textNodes) {
    const parentTag = textNode.parentElement?.tagName ?? ''
    if (SKIP_TAGS.has(parentTag)) continue

    const text = textNode.textContent ?? ''
    if (!text) continue

    const preserveFormatting = !!textNode.parentElement?.closest('pre, code')
    const nodeOptions: CleaningOptions = preserveFormatting
      ? { ...options, collapseRepeatedSpaces: false, preserveParagraphBreaks: true }
      : options

    const result = cleanText(text, nodeOptions)
    if (result.cleanedText !== text) {
      textNode.textContent = result.cleanedText
    }
    counts = mergeCounts(counts, result.counts)
    findings.push(...result.findings)
  }

  const looksLikeFullDocument = /<html[\s>]/i.test(input) || /^\s*<!doctype/i.test(input)
  let cleanedHtml: string
  if (looksLikeFullDocument) {
    const doctypeMatch = input.match(/^\s*<!doctype[^>]*>/i)
    cleanedHtml = (doctypeMatch ? doctypeMatch[0] + '\n' : '') + doc.documentElement.outerHTML
  } else {
    // A fragment's leading <script>/<style>/<meta> tags can be hoisted into
    // the parser's implicit <head> — include it so nothing is silently dropped.
    const headInner = doc.head?.innerHTML ?? ''
    const bodyInner = doc.body?.innerHTML ?? doc.documentElement.outerHTML
    cleanedHtml = headInner + bodyInner
  }

  return { ok: true, cleanedHtml, counts, findings }
}
