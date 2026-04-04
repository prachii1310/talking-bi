'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import KpiForm        from '@/components/input/KpiForm'
import DataUploader   from '@/components/input/DataUploader'
import DashboardGrid  from '@/components/dashboard/DashboardGrid'
import LayoutSelector from '@/components/dashboard/LayoutSelector'
import type { UserKPIInput }    from '@/types/kpi'
import type { DashboardLayout } from '@/types/dashboard'

type Step = 'upload' | 'form' | 'generating' | 'pick-layout'

const GENERATING_STEPS = [
  { icon:'🔌', text:'Connecting to MongoDB…',           delay:0    },
  { icon:'🤖', text:'Claude reading your KPIs…',        delay:1200 },
  { icon:'📊', text:'Computing chart data…',            delay:2400 },
  { icon:'🎨', text:'Designing dashboard layouts…',     delay:3600 },
  { icon:'✨', text:'Adding finishing touches…',         delay:4800 },
]

export default function DashboardPage() {
  const router = useRouter()

  const [step,         setStep]         = useState<Step>('upload')
  const [error,        setError]        = useState<string | null>(null)
  const [layouts,      setLayouts]      = useState<DashboardLayout[]>([])
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [kpiInput,     setKpiInput]     = useState<UserKPIInput | null>(null)
  const [insights,     setInsights]     = useState('')
  const [genStep,      setGenStep]      = useState(0)
  const [uploadedInfo, setUploadedInfo] = useState<any>(null)

  function handleUploadComplete(result: any) {
    setUploadedInfo(result)
    setStep('form')
  }

  async function handleFormSubmit(data: UserKPIInput) {
    setError(null)
    setKpiInput(data)
    setStep('generating')
    setGenStep(0)

    // Animate generating steps
    GENERATING_STEPS.forEach((s, i) => {
      setTimeout(() => setGenStep(i), s.delay)
    })

    try {
      const kpiRes  = await fetch('/api/ai/extract-kpi', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ kpiNames:data.kpiNames, collection:data.collection }),
      })
      const kpiJson = await kpiRes.json()
      if (!kpiRes.ok || kpiJson.error) throw new Error(kpiJson.error || 'KPI extraction failed')

      setInsights(kpiJson.dataInsights ?? '')

      const dashRes  = await fetch('/api/ai/generate-dashboard', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          kpis: kpiJson.kpis, suggestedCharts: kpiJson.suggestedCharts,
          collection: data.collection, colorSchema: data.colorSchema ?? 'blue',
          numberOfCharts: data.numberOfCharts,
        }),
      })
      const dashJson = await dashRes.json()
      if (!dashRes.ok || dashJson.error) throw new Error(dashJson.error || 'Dashboard generation failed')

      sessionStorage.setItem('kpiNames',    JSON.stringify(data.kpiNames))
      sessionStorage.setItem('columnNames', JSON.stringify(kpiJson.columnNames ?? []))

      setLayouts(dashJson.layouts)
      setSelectedId(dashJson.layouts[0]?.id ?? null)
      setStep('pick-layout')

    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      setStep('form')
    }
  }

  function handleConfirm() {
    if (!selectedId) return
    const selected = layouts.find(l => l.id === selectedId)
    if (selected) {
      sessionStorage.setItem('selectedLayout', JSON.stringify(selected))
      sessionStorage.setItem('collection',     kpiInput?.collection ?? '')
      sessionStorage.setItem('kpiNames',       JSON.stringify(kpiInput?.kpiNames ?? []))
      sessionStorage.setItem('columnNames',    JSON.stringify(selected.charts.map(c => c.kpi)))
      router.push(`/dashboard/${selectedId}`)
    }
  }

  // ── GENERATING ─────────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <main style={MS}>
        <div style={{ textAlign:'center', maxWidth:480, width:'100%' }}>

          {/* Big robot */}
          <div style={{
            width:120, height:120, borderRadius:28, margin:'0 auto 2rem',
            background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))',
            border:'2px solid rgba(99,102,241,0.4)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 60px rgba(99,102,241,0.3)',
            animation:'pulse 2s ease infinite',
          }}>
            <div style={{ width:4, height:18, background:'#6366f1', borderRadius:99, marginBottom:4, position:'relative' }}>
              <div style={{ position:'absolute', top:-7, left:'50%', transform:'translateX(-50%)', width:12, height:12, borderRadius:'50%', background:'#6366f1', boxShadow:'0 0 15px #6366f1', animation:'pulse 1s ease infinite' }}/>
            </div>
            <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#818cf8', letterSpacing:6, lineHeight:1, marginBottom:6 }}>◑ ◑</div>
            <div style={{ fontSize:'1rem', color:'#818cf8' }}>…</div>
          </div>

          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.6rem', marginBottom:'0.5rem' }}>
            Building your dashboard
          </h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'2rem' }}>
            AI is analysing your data and designing the perfect layouts
          </p>

          {/* Step indicators */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:'2rem' }}>
            {GENERATING_STEPS.map((s, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 16px',
                borderRadius:12,
                background: i <= genStep ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                border:`1px solid ${i <= genStep ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                transition:'all 0.4s ease',
                opacity: i > genStep ? 0.4 : 1,
              }}>
                <span style={{ fontSize:'1.1rem', minWidth:24 }}>{i < genStep ? '✅' : i === genStep ? s.icon : '○'}</span>
                <span style={{ fontSize:'0.85rem', color: i <= genStep ? 'var(--text)' : 'var(--text-muted)', flex:1, textAlign:'left' }}>
                  {s.text}
                </span>
                {i === genStep && (
                  <div className="spinner" style={{ width:14, height:14, flexShrink:0 }}/>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ height:4, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:99,
              width:`${((genStep+1)/GENERATING_STEPS.length)*100}%`,
              background:'linear-gradient(90deg,#6366f1,#8b5cf6)',
              boxShadow:'0 0 20px rgba(99,102,241,0.6)',
              transition:'width 0.8s ease',
            }}/>
          </div>
        </div>
      </main>
    )
  }

  // ── PICK LAYOUT ────────────────────────────────────────────────────
  if (step === 'pick-layout') {
    return (
      <main style={{ minHeight:'100vh', padding:'2rem 1.5rem', display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:1 }}>
        <div style={{ width:'100%', maxWidth:960 }}>

          {/* Header */}
          <div style={{ marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div className="animate-slide-up">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}>
                  📊
                </div>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.4rem' }}>
                  Choose Your Layout
                </span>
              </div>
              <p style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>
                3 AI-generated layouts from your data · pick the one that fits best
              </p>
            </div>
            <button className="btn btn-ghost" onClick={() => setStep('form')}>← Change inputs</button>
          </div>

          {/* AI insight banner */}
          {insights && (
            <div className="animate-fade-in" style={{
              padding:'1rem 1.25rem', borderRadius:16, marginBottom:'1.5rem',
              background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))',
              border:'1px solid rgba(99,102,241,0.25)',
              display:'flex', alignItems:'flex-start', gap:12,
            }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem',
              }}>🤖</div>
              <div>
                <p style={{ fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--accent)', marginBottom:4 }}>
                  AI Insight
                </p>
                <p style={{ fontSize:'0.88rem', color:'var(--text-muted)', lineHeight:1.6 }}>
                  {insights}
                </p>
              </div>
            </div>
          )}

          {/* Layout cards */}
          <DashboardGrid layouts={layouts} selectedId={selectedId} onSelect={setSelectedId} />

          {/* Confirm */}
          <div style={{ marginTop:'2rem', display:'flex', justifyContent:'center' }}>
            <LayoutSelector onConfirm={handleConfirm} />
          </div>

        </div>
      </main>
    )
  }

  // ── FORM ───────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <main style={MS}>
        <div style={{ width:'100%', maxWidth:600, marginBottom:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>📊</div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem' }}>Talking BI</span>
          </div>
          <button className="btn btn-ghost" style={{ fontSize:'0.78rem' }} onClick={() => setStep('upload')}>
            ↺ Upload different file
          </button>
        </div>

        {uploadedInfo && (
          <div className="animate-fade-in" style={{
            width:'100%', maxWidth:600, marginBottom:'1rem', padding:'0.75rem 1.25rem',
            borderRadius:12, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span>✅</span>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:'0.85rem', color:'var(--success)', fontWeight:500 }}>
                {uploadedInfo.collection}
              </span>
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginLeft:8 }}>
                {uploadedInfo.totalRows?.toLocaleString()} rows loaded
              </span>
            </div>
            <span style={{ fontSize:'0.75rem', color:'var(--text-dim)' }}>
              Try: {uploadedInfo.numericColumns?.slice(0,3).join(', ')}
            </span>
          </div>
        )}

        {error && (
          <div style={{
            width:'100%', maxWidth:600, marginBottom:'1rem', padding:'0.75rem 1rem', borderRadius:12,
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
            color:'var(--danger)', fontSize:'0.85rem',
          }}>
            ⚠ {error}
          </div>
        )}

        <KpiForm
          onSubmit={handleFormSubmit} loading={false}
          defaultCollection={uploadedInfo?.collection}
          suggestedKpis={uploadedInfo?.numericColumns}
        />
      </main>
    )
  }

  // ── UPLOAD (default) ───────────────────────────────────────────────
  return (
    <main style={MS}>
      <div style={{ width:'100%', maxWidth:580 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }} className="animate-slide-up">
          <div style={{
            width:72, height:72, borderRadius:20, margin:'0 auto 1.25rem',
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2rem', boxShadow:'0 12px 40px rgba(99,102,241,0.4)',
          }} className="animate-float">
            📊
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'2rem', marginBottom:'0.5rem' }}>
            <span style={{
              background:'linear-gradient(135deg,#818cf8,#c084fc)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>Talking BI</span>
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.95rem' }}>
            Upload any dataset → AI builds your dashboard in seconds
          </p>
        </div>

        <DataUploader onUploadComplete={handleUploadComplete} />

        <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
          <button className="btn btn-ghost" style={{ fontSize:'0.82rem' }} onClick={() => setStep('form')}>
            Skip — use existing MongoDB collection →
          </button>
        </div>

      </div>
    </main>
  )
}

const MS: React.CSSProperties = {
  minHeight:'100vh', display:'flex', flexDirection:'column',
  alignItems:'center', justifyContent:'center',
  padding:'2rem 1rem', position:'relative', zIndex:1,
}