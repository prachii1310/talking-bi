'use client'
import { useState } from 'react'
import VoiceInput from './VoiceInput'
import type { UserKPIInput } from '@/types/kpi'

interface Props {
  onSubmit:           (data: UserKPIInput) => void
  loading?:           boolean
  defaultCollection?: string
  suggestedKpis?:     string[]
}

const COLORS = [
  { value: 'blue',   label: 'Indigo',  hex: '#6366f1', hex2: '#8b5cf6' },
  { value: 'green',  label: 'Emerald', hex: '#10b981', hex2: '#059669' },
  { value: 'orange', label: 'Amber',   hex: '#f59e0b', hex2: '#ef4444' },
  { value: 'red',    label: 'Rose',    hex: '#ef4444', hex2: '#ec4899' },
  { value: 'purple', label: 'Violet',  hex: '#a855f7', hex2: '#6366f1' },
]

const CHART_ICONS = ['▊','∿','◔','◎','⬡']
const QUICK_KPIS  = ['Sales','Profit','Revenue','Quantity','Discount','Orders','Margin','Growth']

export default function KpiForm({ onSubmit, loading, defaultCollection, suggestedKpis }: Props) {
  const [collection,  setCollection]  = useState(defaultCollection ?? '')
  const [kpiText,     setKpiText]     = useState(suggestedKpis?.slice(0, 4).join(', ') ?? '')
  const [numCharts,   setNumCharts]   = useState(4)
  const [colorSchema, setColorSchema] = useState('blue')
  const [error,       setError]       = useState<string | null>(null)
  const [focused,     setFocused]     = useState<string | null>(null)
  const [robotMood,   setRobotMood]   = useState<'idle'|'thinking'|'happy'|'error'>('idle')

  const C = COLORS.find(c => c.value === colorSchema) ?? COLORS[0]

  const ROBOT = {
    idle:     { eyes:'◉ ◉', mouth:'‿', color:'#6366f1', msg:"I'll analyse your data and build perfect dashboards. Fill in the details!" },
    thinking: { eyes:'◑ ◑', mouth:'…', color:'#f59e0b', msg:'Processing… Generating AI-powered dashboards from your data…'             },
    happy:    { eyes:'^ ^', mouth:'▽', color:'#10b981', msg:'Great choice! Keep adding KPIs to unlock more insights.'                  },
    error:    { eyes:'× ×', mouth:'﹏', color:'#ef4444', msg:"Hmm, something's missing. Check the fields and try again."               },
  }[robotMood]

  function addKpi(kpi: string) {
    const arr = kpiText.split(',').map(k => k.trim()).filter(Boolean)
    if (!arr.map(k => k.toLowerCase()).includes(kpi.toLowerCase())) {
      setKpiText(arr.length ? `${kpiText}, ${kpi}` : kpi)
      setRobotMood('happy'); setTimeout(() => setRobotMood('idle'), 1200)
    }
  }

  function handleVoice(t: string) {
    setKpiText(p => p ? `${p}, ${t}` : t)
    setRobotMood('happy'); setTimeout(() => setRobotMood('idle'), 1500)
  }

  function handleSubmit() {
    setError(null)
    if (!collection.trim()) { setError('Enter your MongoDB collection name.'); setRobotMood('error'); setTimeout(() => setRobotMood('idle'), 2000); return }
    if (!kpiText.trim())    { setError('Enter at least one KPI.'); setRobotMood('error'); setTimeout(() => setRobotMood('idle'), 2000); return }
    const kpiNames = kpiText.split(',').map(k => k.trim()).filter(Boolean)
    setRobotMood('thinking')
    onSubmit({ kpiNames, numberOfCharts: numCharts, colorSchema, collection: collection.trim() })
  }

  return (
    <div style={{ width:'100%', maxWidth:600, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Robot mascot */}
      <div style={{
        display:'flex', alignItems:'center', gap:20, padding:'1.25rem 1.5rem',
        background:`linear-gradient(135deg, ${ROBOT.color}12, ${ROBOT.color}05)`,
        border:`1px solid ${ROBOT.color}30`, borderRadius:20, transition:'all 0.4s',
      }}>
        {/* Robot head */}
        <div style={{
          width:72, height:72, borderRadius:16, flexShrink:0,
          background:`linear-gradient(135deg, ${ROBOT.color}25, ${ROBOT.color}10)`,
          border:`2px solid ${ROBOT.color}50`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          boxShadow:`0 0 30px ${ROBOT.color}30`,
          transition:'all 0.4s',
          animation: robotMood === 'thinking' ? 'pulse 1s ease infinite' : 'none',
        }}>
          {/* Antenna */}
          <div style={{ width:3, height:12, background:ROBOT.color, borderRadius:99, marginBottom:2, position:'relative' }}>
            <div style={{
              position:'absolute', top:-5, left:'50%', transform:'translateX(-50%)',
              width:8, height:8, borderRadius:'50%', background:ROBOT.color,
              boxShadow:`0 0 10px ${ROBOT.color}`, animation:'pulse 2s ease infinite',
            }}/>
          </div>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:ROBOT.color, letterSpacing:4, lineHeight:1, marginBottom:3, transition:'all 0.3s' }}>
            {ROBOT.eyes}
          </div>
          <div style={{ fontSize:'0.7rem', color:ROBOT.color, transition:'all 0.3s' }}>
            {ROBOT.mouth}
          </div>
        </div>
        {/* Speech bubble */}
        <div style={{ flex:1 }}>
          <div style={{
            display:'inline-block', background:`${ROBOT.color}18`,
            border:`1px solid ${ROBOT.color}35`, borderRadius:'12px 12px 12px 4px',
            padding:'6px 14px', fontSize:'0.78rem', color:ROBOT.color,
            fontWeight:500, marginBottom:6, transition:'all 0.3s',
          }}>
            {{ idle:'Ready!', thinking:'Thinking…', happy:'Nice!', error:'Oops!' }[robotMood]}
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', lineHeight:1.5 }}>
            {ROBOT.msg}
          </p>
        </div>
      </div>

      {/* Collection */}
      <div>
        <label style={LS(C.hex)}>
          <span style={{ color:C.hex, fontFamily:'var(--font-display)', fontWeight:800 }}>01</span>
          &nbsp;— MongoDB Collection
        </label>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:'1rem', opacity:0.4 }}>🗄</span>
          <input className="input" placeholder="e.g. sales, superstore, orders"
            value={collection} disabled={loading}
            onChange={e => setCollection(e.target.value)}
            onFocus={() => setFocused('col')} onBlur={() => setFocused(null)}
            style={{ paddingLeft:'2.5rem', borderColor: focused==='col' ? C.hex : undefined, boxShadow: focused==='col' ? `0 0 0 3px ${C.hex}20` : undefined, transition:'all 0.2s' }}
          />
        </div>
        <p style={HS}>The MongoDB collection containing your data</p>
      </div>

      {/* KPI input */}
      <div>
        <label style={LS(C.hex)}>
          <span style={{ color:C.hex, fontFamily:'var(--font-display)', fontWeight:800 }}>02</span>
          &nbsp;— KPIs to Analyse
        </label>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
          <VoiceInput onTranscript={handleVoice} disabled={loading} />
          <input className="input" placeholder="Sales, Profit, Quantity, Discount…"
            value={kpiText} disabled={loading}
            onChange={e => setKpiText(e.target.value)}
            onFocus={() => setFocused('kpi')} onBlur={() => setFocused(null)}
            style={{ flex:1, borderColor: focused==='kpi' ? C.hex : undefined, boxShadow: focused==='kpi' ? `0 0 0 3px ${C.hex}20` : undefined, transition:'all 0.2s' }}
          />
        </div>
        {/* Quick add pills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          <span style={{ fontSize:'0.7rem', color:'var(--text-dim)', alignSelf:'center' }}>Quick add:</span>
          {(suggestedKpis?.length ? suggestedKpis.slice(0,8) : QUICK_KPIS).map(kpi => {
            const on = kpiText.toLowerCase().includes(kpi.toLowerCase())
            return (
              <button key={kpi} onClick={() => addKpi(kpi)} disabled={loading||on} style={{
                padding:'3px 12px', borderRadius:99, fontSize:'0.73rem', cursor: on ? 'default' : 'pointer',
                border:`1px solid ${on ? C.hex+'60' : 'var(--border-light)'}`,
                background: on ? `${C.hex}18` : 'transparent',
                color: on ? C.hex : 'var(--text-muted)',
                fontWeight: on ? 600 : 400, transition:'all 0.15s',
              }}>
                {on ? `✓ ${kpi}` : `+ ${kpi}`}
              </button>
            )
          })}
        </div>
        <p style={HS}>Separate with commas · speak them · or click to add</p>
      </div>

      {/* Number of charts */}
      <div>
        <label style={LS(C.hex)}>
          <span style={{ color:C.hex, fontFamily:'var(--font-display)', fontWeight:800 }}>03</span>
          &nbsp;— Number of Charts&nbsp;
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.2rem', color:C.hex, textShadow:`0 0 20px ${C.hex}80` }}>
            {numCharts}
          </span>
        </label>
        <input type="range" min={2} max={8} value={numCharts}
          onChange={e => setNumCharts(Number(e.target.value))} disabled={loading}
          style={{ width:'100%', accentColor:C.hex, cursor:'pointer', height:6 }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
          {[2,3,4,5,6,7,8].map(n => (
            <span key={n} style={{ fontSize:'0.65rem', color: n===numCharts ? C.hex : 'var(--text-dim)', fontWeight: n===numCharts ? 700 : 400, transition:'all 0.2s' }}>
              {n}
            </span>
          ))}
        </div>
        {/* Chart preview dots */}
        <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
          {Array.from({ length:numCharts }).map((_,i) => (
            <div key={i} style={{
              width:36, height:36, borderRadius:10,
              background:`${C.hex}18`, border:`1px solid ${C.hex}35`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.9rem', color:C.hex, transition:'all 0.3s',
            }}>
              {CHART_ICONS[i % CHART_ICONS.length]}
            </div>
          ))}
        </div>
      </div>

      {/* Color theme */}
      <div>
        <label style={LS(C.hex)}>
          <span style={{ color:C.hex, fontFamily:'var(--font-display)', fontWeight:800 }}>04</span>
          &nbsp;— Color Theme
        </label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {COLORS.map(c => (
            <button key={c.value} onClick={() => setColorSchema(c.value)} disabled={loading} style={{
              padding:'8px 16px', borderRadius:12, fontSize:'0.82rem', cursor:'pointer',
              border: colorSchema===c.value ? `2px solid ${c.hex}` : '1px solid var(--border-light)',
              background: colorSchema===c.value ? `linear-gradient(135deg,${c.hex}25,${c.hex2}15)` : 'transparent',
              color: colorSchema===c.value ? c.hex : 'var(--text-muted)',
              fontWeight: colorSchema===c.value ? 600 : 400,
              boxShadow: colorSchema===c.value ? `0 0 20px ${c.hex}30` : 'none',
              transition:'all 0.2s', display:'flex', alignItems:'center', gap:7,
            }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:`linear-gradient(135deg,${c.hex},${c.hex2})` }}/>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop:10, height:5, borderRadius:99, background:`linear-gradient(90deg,${C.hex},${C.hex2})`, boxShadow:`0 0 20px ${C.hex}50`, transition:'all 0.4s' }}/>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'0.75rem 1rem', borderRadius:'var(--radius)', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'var(--danger)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:8 }}>
          ⚠ {error}
        </div>
      )}

      {/* Submit button */}
      <button onClick={handleSubmit} disabled={loading}
        style={{
          width:'100%', padding:'1rem', borderRadius:14, border:'none',
          background: loading ? 'var(--bg-hover)' : `linear-gradient(135deg,${C.hex},${C.hex2})`,
          color:'#fff', fontSize:'1rem', fontWeight:600, fontFamily:'var(--font-display)',
          cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.3s',
          boxShadow: loading ? 'none' : `0 8px 30px ${C.hex}40`,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10, letterSpacing:'0.02em',
        }}
        onMouseEnter={e => { if(!loading){ const t=e.currentTarget; t.style.transform='translateY(-2px)'; t.style.boxShadow=`0 14px 40px ${C.hex}55` }}}
        onMouseLeave={e => { const t=e.currentTarget; t.style.transform='none'; t.style.boxShadow=loading?'none':`0 8px 30px ${C.hex}40` }}
      >
        {loading ? (
          <><div className="spinner" style={{ width:18, height:18, borderTopColor:'#fff' }}/> Generating dashboards…</>
        ) : (
          <><span style={{ fontSize:'1.1rem' }}>🤖</span> Generate AI Dashboards <span style={{ opacity:0.7 }}>→</span></>
        )}
      </button>

      <p style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--text-dim)' }}>
        Powered by Groq AI · Llama 3.3 70B · MongoDB
      </p>
    </div>
  )
}

const LS = (hex: string): React.CSSProperties => ({
  display:'flex', alignItems:'center', gap:8, fontSize:'0.78rem', fontWeight:600,
  letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-muted)',
  marginBottom:10, fontFamily:'var(--font-display)',
})

const HS: React.CSSProperties = { fontSize:'0.72rem', color:'var(--text-dim)', marginTop:6, lineHeight:1.4 }