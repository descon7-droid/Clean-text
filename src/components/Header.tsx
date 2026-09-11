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
        <a href="/" className="flex items-center gap-2 text-ink" aria-label="WordWasher home">
          <svg width="36" height="36" viewBox="9.375 9.375 81.25 81.25" fill="#C6FF00" aria-hidden="true">
            <path d="m63.543 73.699-13.543-13.543 4.7891-4.7852 8.7539 8.7539 19.426-19.426c-4.918-5.0742-11.801-8.2383-19.426-8.2383-14.957 0-27.082 12.125-27.082 27.082 0 14.961 12.125 27.082 27.082 27.082 14.961 0 27.082-12.125 27.082-27.082 0-4.8711-1.3008-9.4258-3.5508-13.375zm10.156-44.012c0-1.8711 1.5156-3.3867 3.3867-3.3867h3.3867v-3.3867h-3.3867c-1.8711 0-3.3867-1.5156-3.3867-3.3867v-3.3867h-3.3867v3.3828c0 1.8711-1.5156 3.3867-3.3867 3.3867h-3.3867v3.3867h3.3867c1.8672 0 3.3828 1.5156 3.3867 3.3867v3.3867h3.3867zm-50.781 0c0-3.7383 3.0312-6.7695 6.7695-6.7695h3.3867v-3.3867h-3.3867c-3.7383 0-6.7695-3.0312-6.7695-6.7695v-3.3867h-3.3867v3.3867c0 3.7383-3.0352 6.7695-6.7695 6.7695h-3.3867v3.3867h3.3867c3.7383 0 6.7695 3.0273 6.7695 6.7695v3.3867h3.3867zm0 22.004c0 2.8047-2.2695 5.0781-5.0781 5.0781-2.7969 0-5.0781-2.2734-5.0781-5.0781 0-2.8047 2.2812-5.0781 5.0781-5.0781 2.8086 0 5.0781 2.2734 5.0781 5.0781zm33.852-35.547c0 1.8633-1.5195 3.3867-3.3867 3.3867-1.8633 0-3.3867-1.5195-3.3867-3.3867 0-1.8633 1.5195-3.3867 3.3867-3.3867 1.8633 0 3.3867 1.5195 3.3867 3.3867zm-16.926 16.93c0 1.8633-1.5195 3.3867-3.3867 3.3867-1.8633 0-3.3867-1.5195-3.3867-3.3867 0-1.8633 1.5195-3.3867 3.3867-3.3867 1.8633 0 3.3867 1.5195 3.3867 3.3867zm-10.156 40.625c0 1.8633-1.5195 3.3867-3.3867 3.3867-1.8633 0-3.3867-1.5195-3.3867-3.3867 0-1.8633 1.5195-3.3867 3.3867-3.3867 1.8633 0 3.3867 1.5195 3.3867 3.3867z" />
          </svg>
          <span className="font-script text-2xl">WordWasher</span>
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
