'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ChartRenderer from '@/components/dashboard/ChartRenderer'
import type { DashboardLayout } from '@/types/dashboard'

export default function DashboardViewPage() {
  const params = useParams()
  const router = useRouter()
  const [layout,  setLayout]  = useState<DashboardLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('selectedLayout')
    if (raw) {
      try {
        setLayout(JSON.parse(raw))
        setTimeout(() => setVisible(true), 100)
      } catch { router.push('/dashboard') }
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }, [router])

  if (loading || !layout) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading dashboard…</p>
        </div>
      </main>
    )
  }

  const cols = layout.columns ?? 2

  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem', position: 'relative', zIndex: 1 }}>

      {/* Top bar */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   '2rem',
        flexWrap:       'wrap',
        gap:            12,
        opacity:        visible ? 1 : 0,
        transform:      visible ? 'none' : 'translateY(-10px)',
        transition:     'all 0.5s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>📊</div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '1.3rem',
            }}>
              {layout.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {layout.description}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => router.push('/dashboard')}>
            ← Change layout
          </button>
          <button className="btn btn-primary" onClick={() => router.push('/chat')}>
            💬 Chat with data →
          </button>
        </div>
      </div>

      {/* Stat cards row */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: `repeat(${Math.min(layout.charts.length, 4)}, 1fr)`,
        gap:                 14,
        marginBottom:        '2rem',
      }}>
        {layout.charts.map((chart, i) => {
          const dataset = chart.data.datasets[0]
          const values  = dataset?.data as number[] ?? []
          const total   = values.reduce((a, b) => a + b, 0)
          const max     = Math.max(...values)
          const labels  = chart.data.labels as string[]
          const maxIdx  = values.indexOf(max)
          const display = ['pie','doughnut'].includes(chart.type) ? max : total
          const formatted = display > 1000000
            ? `${(display/1000000).toFixed(1)}M`
            : display > 1000
            ? `${(display/1000).toFixed(1)}K`
            : display.toFixed(0)

          return (
            <div key={chart.id} className="stat-card animate-slide-up" style={{
              animationDelay:    `${i * 0.08}s`,
              animationFillMode: 'forwards',
              opacity:           0,
            }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                {chart.kpi}
              </p>
              <p style={{
                fontFamily:  'var(--font-display)',
                fontSize:    '2rem',
                fontWeight:  800,
                color:       chart.color,
                lineHeight:  1,
                marginBottom: 6,
                textShadow: `0 0 30px ${chart.color}66`,
              }}>
                {formatted}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {labels[maxIdx] && `Peak: ${labels[maxIdx]}`}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts grid */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: cols === 1 ? '1fr' : `repeat(${cols}, 1fr)`,
        gap:                 20,
      }}>
        {layout.charts.map((chart, i) => (
          <div key={chart.id} className="animate-slide-up" style={{
            animationDelay:    `${0.2 + i * 0.1}s`,
            animationFillMode: 'forwards',
            opacity:           0,
          }}>
            <ChartRenderer chart={chart} />
          </div>
        ))}
      </div>

    </main>
  )
}