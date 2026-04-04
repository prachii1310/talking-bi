'use client'
import { useEffect, useState } from 'react'
import { useRouter }       from 'next/navigation'
import ChatBox             from '@/components/chat/ChatBox'
import ChartRenderer       from '@/components/dashboard/ChartRenderer'
import InsightSummary      from '@/components/insights/InsightSummary'
import KpiCoverage         from '@/components/insights/KpiCoverage'
import type { DashboardLayout } from '@/types/dashboard'
import type { KPICoverage }     from '@/types/kpi'

export default function ChatPage() {
  const router = useRouter()

  const [layout,     setLayout]     = useState<DashboardLayout | null>(null)
  const [collection, setCollection] = useState('sales')
  const [kpiNames,   setKpiNames]   = useState<string[]>([])
  const [columnNames, setColumnNames] = useState<string[]>([])

  const [summary,    setSummary]    = useState('')
  const [coverage,   setCoverage]   = useState<KPICoverage | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightFetched, setInsightFetched] = useState(false)

  useEffect(() => {
    const raw  = sessionStorage.getItem('selectedLayout')
    const col  = sessionStorage.getItem('collection')  || 'sales'
    const kpis = sessionStorage.getItem('kpiNames')    || ''
    const cols = sessionStorage.getItem('columnNames') || ''

    setCollection(col)
    setKpiNames(kpis ? JSON.parse(kpis) : [])
    setColumnNames(cols ? JSON.parse(cols) : [])

    if (raw) {
      try { setLayout(JSON.parse(raw)) }
      catch { router.push('/dashboard') }
    } else {
      router.push('/dashboard')
    }
  }, [router])

  async function fetchInsights(l: DashboardLayout) {
    if (insightFetched) return
    setInsightFetched(true)
    setInsightLoading(true)

    try {
      const res  = await fetch('/api/ai/insight-summary', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          dashboardTitle: l.title,
          charts:         l.charts,
          kpiNames,
          columnNames,
        }),
      })
      const json = await res.json()
      if (json.summary)  setSummary(json.summary)
      if (json.coverage) setCoverage(json.coverage)
    } catch (err) {
      console.error('Insight fetch failed:', err)
    } finally {
      setInsightLoading(false)
    }
  }

  // Fetch insights once layout is loaded
  useEffect(() => {
    if (layout && kpiNames.length > 0 && !insightFetched) {
      fetchInsights(layout)
    }
  }, [layout, kpiNames])

  if (!layout) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>
            📊 Talking BI
          </span>
          <span style={{ color: 'var(--border-light)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {layout.title}
          </span>
        </div>
        <button className="btn btn-ghost" onClick={() => router.push('/dashboard')}>
          ← New Dashboard
        </button>
      </div>

      {/* Main grid — left: charts + insights, right: chat */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap:                 20,
        alignItems:          'start',
      }}>

        {/* LEFT — charts + insight + coverage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <h2 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-muted)' }}>
            Your Charts
          </h2>

          {/* Charts grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: layout.columns === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap:                 16,
          }}>
            {layout.charts.map(chart => (
              <ChartRenderer key={chart.id} chart={chart} />
            ))}
          </div>

          {/* KPI Coverage */}
          {coverage && <KpiCoverage coverage={coverage} />}

          {/* Insight Summary */}
          {(insightLoading || summary) && (
            <InsightSummary summary={summary} loading={insightLoading} />
          )}

        </div>

        {/* RIGHT — chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'sticky', top: '1.5rem' }}>
          <h2 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            AI Assistant
          </h2>
          <div style={{ height: 620 }}>
            <ChatBox layout={layout} collection={collection} />
          </div>
        </div>

      </div>
    </main>
  )
}