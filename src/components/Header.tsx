import { Lock } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import type { Theme } from '../hooks/useTheme'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="border-b border-border-strong bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6">
        <a href="/" className="flex items-center gap-2 font-display font-semibold text-ink" aria-label="CleanText home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cta text-cta-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 13.5 10 18.5L19 6.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-lg tracking-tight">CleanText</span>
        </a>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-1.5 font-mono text-xs font-medium text-ink-soft">
            <Lock size={13} strokeWidth={2.25} aria-hidden="true" />
            <span>Private. Local. No uploads.</span>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
