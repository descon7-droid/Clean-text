import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-border-strong bg-surface-muted transition-colors"
    >
      <Sun size={11} strokeWidth={2.5} className="absolute left-[7px] text-muted" aria-hidden="true" />
      <Moon size={11} strokeWidth={2.5} className="absolute right-[7px] text-muted" aria-hidden="true" />
      <span
        className={`absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-lime text-lime-ink shadow-soft transition-transform ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon size={11} strokeWidth={2.5} /> : <Sun size={11} strokeWidth={2.5} />}
      </span>
    </button>
  )
}
