import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Inspector } from '../components/Inspector'
import { MAX_INSPECTOR_FINDINGS } from '../types/cleaning'
import type { Finding } from '../types/cleaning'

function buildFindings(count: number): Finding[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    codePoint: 0x200b,
    unicode: 'U+200B',
    name: 'Zero Width Space',
    category: 'zero-width',
    action: 'removed',
  }))
}

describe('Inspector — display cap', () => {
  it('shows a truncation notice and renders only the first 500 rows when there are more', () => {
    render(<Inspector findings={buildFindings(MAX_INSPECTOR_FINDINGS + 340)} />)

    fireEvent.click(screen.getByRole('button', { name: /Inspect changes/ }))

    const rows = screen.getAllByText('U+200B')
    expect(rows).toHaveLength(MAX_INSPECTOR_FINDINGS)
    expect(
      screen.getByText(`Showing first ${MAX_INSPECTOR_FINDINGS.toLocaleString()} of ${(MAX_INSPECTOR_FINDINGS + 340).toLocaleString()} detections.`),
    ).toBeInTheDocument()
  })

  it('shows no truncation notice when findings are at or under the cap', () => {
    render(<Inspector findings={buildFindings(MAX_INSPECTOR_FINDINGS)} />)
    fireEvent.click(screen.getByRole('button', { name: /Inspect changes/ }))
    expect(screen.queryByText(/Showing first/)).not.toBeInTheDocument()
    expect(screen.getAllByText('U+200B')).toHaveLength(MAX_INSPECTOR_FINDINGS)
  })

  it('the toggle button is disabled and shows no count when there are no findings', () => {
    render(<Inspector findings={[]} />)
    const button = screen.getByRole('button', { name: 'Inspect changes' })
    expect(button).toBeDisabled()
  })
})
