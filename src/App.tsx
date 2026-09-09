import { useState } from 'react'
import { Download, Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { DropZone } from './components/DropZone'
import { TextInput } from './components/TextInput'
import { CleaningOptions } from './components/CleaningOptions'
import { ResultSummary } from './components/ResultSummary'
import { Inspector } from './components/Inspector'
import { FileTypeBadge } from './components/FileTypeBadge'
import { Notice } from './components/Notice'
import { CopyButton } from './components/CopyButton'
import { HowItWorks } from './components/HowItWorks'
import { HiddenCharactersInfo } from './components/HiddenCharactersInfo'
import { PrivacySection } from './components/PrivacySection'
import { cleanTxt } from './lib/cleanTxt'
import { cleanMarkdown } from './lib/cleanMarkdown'
import { cleanJson } from './lib/cleanJson'
import { cleanCsv } from './lib/cleanCsv'
import { cleanHtml } from './lib/cleanHtml'
import { validateFile, type FileKind } from './lib/fileTypes'
import { buildCleanedFilename, downloadBlob, downloadText } from './lib/download'
import { DEFAULT_CLEANING_OPTIONS, type CleanCounts, type CleaningOptions as CleaningOptionsType, type Finding } from './types/cleaning'

type OutputState =
  | {
      type: 'text' | 'json' | 'csv' | 'html'
      content: string
      counts: CleanCounts
      findings: Finding[]
      originalLength: number
      cleanedLength: number
      downloadName: string
      downloadMime: string
    }
  | {
      type: 'pdf'
      content: string
      counts: CleanCounts
      findings: Finding[]
      originalLength: number
      cleanedLength: number
      pageCount: number
      downloadBaseName: string
    }
  | {
      type: 'docx'
      blob: Blob
      counts: CleanCounts
      findings: Finding[]
      downloadName: string
    }

function App() {
  const { theme, toggleTheme } = useTheme()
  const [pastedText, setPastedText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedKind, setSelectedKind] = useState<FileKind | null>(null)
  const [options, setOptions] = useState<CleaningOptionsType>(DEFAULT_CLEANING_OPTIONS)
  const [output, setOutput] = useState<OutputState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  function handleFileSelected(file: File) {
    if (isProcessing) return
    const validation = validateFile(file)
    setError(null)
    setOutput(null)
    if (!validation.ok) {
      setSelectedFile(null)
      setSelectedKind(null)
      setError(validation.message)
      return
    }
    setSelectedFile(file)
    setSelectedKind(validation.kind)
    setPastedText('')
  }

  function handlePastedTextChange(value: string) {
    setPastedText(value)
    if (value.length > 0) {
      setSelectedFile(null)
      setSelectedKind(null)
    }
    setError(null)
  }

  function startOver() {
    setPastedText('')
    setSelectedFile(null)
    setSelectedKind(null)
    setOutput(null)
    setError(null)
    setIsProcessing(false)
  }

  async function handleClean() {
    setError(null)
    setOutput(null)

    if (selectedFile && selectedKind) {
      setIsProcessing(true)
      try {
        await processFile(selectedFile, selectedKind)
      } finally {
        setIsProcessing(false)
      }
      return
    }

    if (pastedText.trim().length > 0) {
      const result = cleanTxt(pastedText, options)
      setOutput({
        type: 'text',
        content: result.cleanedText,
        counts: result.counts,
        findings: result.findings,
        originalLength: result.originalLength,
        cleanedLength: result.cleanedLength,
        downloadName: 'cleaned-text.txt',
        downloadMime: 'text/plain;charset=utf-8',
      })
    }
  }

  async function processFile(file: File, kind: FileKind) {
    try {
      if (kind === 'txt' || kind === 'md') {
        const text = await file.text()
        const result = kind === 'md' ? cleanMarkdown(text, options) : cleanTxt(text, options)
        setOutput({
          type: 'text',
          content: result.cleanedText,
          counts: result.counts,
          findings: result.findings,
          originalLength: result.originalLength,
          cleanedLength: result.cleanedLength,
          downloadName: buildCleanedFilename(file.name),
          downloadMime: kind === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8',
        })
        return
      }

      if (kind === 'json') {
        const text = await file.text()
        const result = cleanJson(text, options)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setOutput({
          type: 'json',
          content: result.cleanedJson,
          counts: result.counts,
          findings: result.findings,
          originalLength: Array.from(text).length,
          cleanedLength: Array.from(result.cleanedJson).length,
          downloadName: buildCleanedFilename(file.name),
          downloadMime: 'application/json;charset=utf-8',
        })
        return
      }

      if (kind === 'csv') {
        const text = await file.text()
        const result = cleanCsv(text, options)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setOutput({
          type: 'csv',
          content: result.cleanedCsv,
          counts: result.counts,
          findings: result.findings,
          originalLength: Array.from(text).length,
          cleanedLength: Array.from(result.cleanedCsv).length,
          downloadName: buildCleanedFilename(file.name),
          downloadMime: 'text/csv;charset=utf-8',
        })
        return
      }

      if (kind === 'html') {
        const text = await file.text()
        const result = cleanHtml(text, options)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setOutput({
          type: 'html',
          content: result.cleanedHtml,
          counts: result.counts,
          findings: result.findings,
          originalLength: Array.from(text).length,
          cleanedLength: Array.from(result.cleanedHtml).length,
          downloadName: buildCleanedFilename(file.name),
          downloadMime: 'text/html;charset=utf-8',
        })
        return
      }

      if (kind === 'docx') {
        const buffer = await file.arrayBuffer()
        const { cleanDocx } = await import('./lib/cleanDocx')
        const result = await cleanDocx(buffer, options)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setOutput({
          type: 'docx',
          blob: result.blob,
          counts: result.counts,
          findings: result.findings,
          downloadName: buildCleanedFilename(file.name),
        })
        return
      }

      if (kind === 'pdf') {
        const buffer = await file.arrayBuffer()
        const { cleanPdf } = await import('./lib/cleanPdf')
        const result = await cleanPdf(buffer, options)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setOutput({
          type: 'pdf',
          content: result.cleanedText,
          counts: result.counts,
          findings: result.findings,
          originalLength: result.originalLength,
          cleanedLength: result.cleanedLength,
          pageCount: result.pageCount,
          downloadBaseName: buildCleanedFilename(file.name, 'txt').replace(/\.txt$/, ''),
        })
        return
      }
    } catch {
      setError('Something went wrong while reading this file. It may be damaged or an unsupported variant.')
    }
  }

  const canClean = !isProcessing && (selectedFile !== null || pastedText.trim().length > 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-16 pb-8 text-center sm:px-6">
          <span className="inline-block rounded-full bg-lime px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-lime-ink">
            Drop in. Clean up. Copy or download.
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Text, cleaned. Nothing rewritten.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            Strips invisible characters and formatting artefacts from anything you paste or drop —
            zero-width spaces, stray Unicode, hidden markup. Your words stay exactly yours.
          </p>
          <p className="mt-5 text-sm font-semibold text-ink">Your document stays on your device.</p>
        </section>

        <section aria-labelledby="cleaner-heading" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <h2 id="cleaner-heading" className="sr-only">
            Clean text or a document
          </h2>
          <div className="rounded-2xl border-[1.5px] border-border-strong bg-surface p-5 shadow-card sm:p-6">
            <DropZone
              onFileSelected={handleFileSelected}
              selectedFileName={selectedFile?.name}
              selectedFileSize={selectedFile?.size}
            />

            <div className="my-6 flex items-center gap-3 font-mono text-xs font-bold tracking-wide text-muted">
              <span className="h-px flex-1 bg-border" />
              OR PASTE TEXT
              <span className="h-px flex-1 bg-border" />
            </div>

            <TextInput
              value={pastedText}
              onChange={handlePastedTextChange}
              onClean={handleClean}
              onClear={startOver}
              disabled={isProcessing || selectedFile !== null}
            />

            <div className="mt-6">
              <CleaningOptions options={options} onChange={setOptions} />
            </div>

            <button
              type="button"
              onClick={handleClean}
              disabled={!canClean}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cta px-4 py-3 text-sm font-semibold text-cta-ink shadow-soft transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles size={16} aria-hidden="true" />
              )}
              {isProcessing ? 'Cleaning…' : 'Clean'}
            </button>

            {error && (
              <div className="mt-5">
                <Notice tone="error">{error}</Notice>
              </div>
            )}
          </div>

          {output && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedKind && <FileTypeBadge kind={selectedKind} />}
                  <h3 className="text-sm font-medium text-ink">Result</h3>
                </div>
                <button
                  type="button"
                  onClick={startOver}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Start over
                </button>
              </div>

              <ResultSummary
                counts={output.counts}
                originalLength={output.type === 'docx' ? undefined : output.originalLength}
                cleanedLength={output.type === 'docx' ? undefined : output.cleanedLength}
              />

              {output.type === 'docx' ? (
                <div className="rounded-xl border-[1.5px] border-border-strong bg-surface p-5">
                  <p className="text-sm text-ink-soft">
                    Your cleaned Word document is ready. Formatting, styles, tables and structure are
                    preserved — only hidden characters and formatting artefacts inside the text were changed.
                  </p>
                  <p className="mt-2 text-xs text-muted">Complex Word features may not always round-trip perfectly.</p>
                  <button
                    type="button"
                    onClick={() => downloadBlob(output.blob, output.downloadName)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-cta-ink shadow-soft transition-opacity hover:opacity-90"
                  >
                    <Download size={15} aria-hidden="true" />
                    Download {output.downloadName}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border-[1.5px] border-border-strong bg-surface p-5">
                  {output.type === 'pdf' && (
                    <Notice tone="info">
                      PDF text is extracted and cleaned. The original PDF page layout is not recreated.
                    </Notice>
                  )}
                  <label htmlFor="cleaned-output" className="sr-only">
                    Cleaned output
                  </label>
                  <textarea
                    id="cleaned-output"
                    readOnly
                    value={output.content}
                    rows={10}
                    className="mt-3 w-full resize-y rounded-lg border border-border bg-surface-muted p-4 font-mono text-sm leading-relaxed text-ink outline-none"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <CopyButton getText={() => output.content} />
                    {output.type === 'pdf' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => downloadText(output.content, `${output.downloadBaseName}.txt`)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-cta px-3.5 py-2 text-sm font-semibold text-cta-ink shadow-soft transition-opacity hover:opacity-90"
                        >
                          <Download size={15} aria-hidden="true" />
                          Download TXT
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadText(output.content, `${output.downloadBaseName}.md`, 'text/markdown;charset=utf-8')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
                        >
                          <Download size={15} aria-hidden="true" />
                          Download Markdown
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => downloadText(output.content, output.downloadName, output.downloadMime)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-cta px-3.5 py-2 text-sm font-semibold text-cta-ink shadow-soft transition-opacity hover:opacity-90"
                      >
                        <Download size={15} aria-hidden="true" />
                        Download {output.downloadName}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <Inspector findings={output.findings} />
            </div>
          )}
        </section>

        <div className="border-t border-border">
          <HowItWorks />
        </div>
        <HiddenCharactersInfo />
        <PrivacySection />
      </main>

      <Footer />
    </div>
  )
}

export default App
