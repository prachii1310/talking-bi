import type { DashboardLayout } from '@/types/dashboard'
import DashboardPreview from './DashboardPreview'

export default function DashboardGrid({
  layouts, selectedId, onSelect,
}: {
  layouts:    DashboardLayout[]
  selectedId: string | null
  onSelect:   (id: string) => void
}) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap:                 20,
    }}>
      {layouts.map((layout, i) => (
        <DashboardPreview
          key={layout.id}
          layout={layout}
          selected={layout.id === selectedId}
          onSelect={onSelect}
          index={i}
        />
      ))}
    </div>
  )
}