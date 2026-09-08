import type { ReactNode } from 'react'
import { AlertTriangle, Info } from 'lucide-react'

interface NoticeProps {
  tone?: 'info' | 'warn' | 'error'
  children: ReactNode
}

const TONE_STYLES = {
  info: 'border-border bg-surface-muted text-ink-soft',
  warn: 'border-warn-soft bg-warn-soft text-warn',
  error: 'border-danger-soft bg-danger-soft text-danger',
} as const

export function Notice({ tone = 'info', children }: NoticeProps) {
  const Icon = tone === 'info' ? Info : AlertTriangle
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${TONE_STYLES[tone]}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
