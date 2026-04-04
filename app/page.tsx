'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const ROBOT_MSGS = [
  "Upload any CSV — I'll analyse it instantly.",
  "Ask me anything about your data in plain English.",
  "I generate 3 dashboard layouts. You pick the best.",
  "Speak to me with voice input. I'm listening.",
  "I'll find insights your spreadsheet can never show.",
]

const FEATURES = [
  { icon:'📂', title:'Upload Any CSV',   desc:'Drag & drop any dataset. Sales, finance, HR, anything.',  c1:'#06b6d4', c2:'rgba(6,182,212,0.15)'  },
  { icon:'🤖', title:'AI Reads KPIs',    desc:'Groq AI extracts metrics and matches your data columns.', c1:'#10b981', c2:'rgba(16,185,129,0.12)'  },
  { icon:'📊', title:'3 Layouts',        desc:'Three dashboard designs built from your real data.',       c1:'#34d399', c2:'rgba(52,211,153,0.1)'   },
  { icon:'🎤', title:'Voice + Chat',     desc:'Speak questions. AI answers and reads back aloud.',        c1:'#22d3ee', c2:'rgba(34,211,238,0.1)'   },
  { icon:'📈', title:'Live Charts',      desc:'Bar, line, pie, donut, radar — all your real data.',      c1:'#06b6d4', c2:'rgba(6,182,212,0.12)'   },
  { icon:'🎯', title:'KPI Coverage',     desc:'See which KPIs are tracked vs missing, with % score.',    c1:'#10b981', c2:'rgba(16,185,129,0.1)'   },
]

function Robot({ color = '#06b6d4', size = 'md', label = '' }: {
  color?: string; size?: 'sm'|'md'|'lg'; label?: string
}) {
  const [eyeOpen, setEyeOpen] = useState(true)
  const S = {
    sm: { w:60,  h:70,  r:14, eyeS:8,  gap:10, dot:5  },
    md: { w:90,  h:105, r:20, eyeS:13, gap:16, dot:7  },
    lg: { w:130, h:150, r:26, eyeS:18, gap:22, dot:9  },
  }[size]

  useEffect(() => {
    const delay = 3000 + Math.random() * 2000
    const t = setInterval(() => {
      setEyeOpen(false)
      setTimeout(() => setEyeOpen(true), 130)
    }, delay)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <div style={{
        width:S.w, height:S.h, borderRadius:S.r,
        background:`linear-gradient(160deg,${color}18,${color}06)`,
        border:`1.5px solid ${color}40`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:8, position:'relative', overflow:'hidden',
        boxShadow:`0 0 30px ${color}20, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>
        {/* Scan line */}
        <div style={{ position:'absolute', left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${color}70,transparent)`, animation:'scanLine 2.5s linear infinite', top:0 }}/>
        {/* Antenna */}
        <div style={{ position:'absolute', top:-8, width:2, height:12, background:color, borderRadius:99 }}>
          <div style={{ position:'absolute', top:-5, left:'50%', transform:'translateX(-50%)', width:S.dot, height:S.dot, borderRadius:'50%', background:color, boxShadow:`0 0 10px ${color}`, animation:'glowPulse 1.5s ease infinite' }}/>
        </div>
        {/* Eyes */}
        <div style={{ display:'flex', gap:S.gap, marginTop:8 }}>
          {[0,1].map(i => (
            <div key={i} style={{
              width:S.eyeS, height:S.eyeS, borderRadius:'50%',
              background:`radial-gradient(circle at 35% 35%,${color}ff,${color}99)`,
              boxShadow:`0 0 ${S.eyeS}px ${color}90`,
              transform: eyeOpen ? 'scaleY(1)' : 'scaleY(0.08)',
              transition:'transform 0.08s',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{ width:S.eyeS*0.35, height:S.eyeS*0.35, borderRadius:'50%', background:'rgba(255,255,255,0.5)' }}/>
            </div>
          ))}
        </div>
        {/* Mouth */}
        <div style={{ width:S.w*0.5, height:5, borderRadius:99, background:`${color}15`, overflow:'hidden' }}>
          <div style={{ height:'100%', width:'55%', borderRadius:99, background:color, animation:'scan 1.8s ease infinite', boxShadow:`0 0 6px ${color}` }}/>
        </div>
        {/* Chest dots */}
        <div style={{ display:'flex', gap:5 }}>
          {['#06b6d4','#10b981','#34d399'].map((c,i) => (
            <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:c, boxShadow:`0 0 6px ${c}`, animation:`pulse ${1+i*0.3}s ease infinite`, animationDelay:`${i*0.15}s` }}/>
          ))}
        </div>
      </div>
      {label && (
        <span style={{ fontSize:'0.6rem', color, fontFamily:'var(--font-display)', fontWeight:700, letterSpacing:3, textTransform:'uppercase', opacity:0.6 }}>
          {label}
        </span>
      )}
    </div>
  )
}

export default function HomePage() {
  const [msgIdx,   setMsgIdx]   = useState(0)
  const [typed,    setTyped]    = useState('')
  const [typing,   setTyping]   = useState(true)
  const [botColor, setBotColor] = useState('#06b6d4')
  const [visible,  setVisible]  = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  useEffect(() => {
    const msg = ROBOT_MSGS[msgIdx]
    setTyped(''); setTyping(true)
    let i = 0
    const t = setInterval(() => {
      setTyped(msg.slice(0, i+1)); i++
      if (i >= msg.length) {
        clearInterval(t); setTyping(false)
        setTimeout(() => setMsgIdx(p => (p+1) % ROBOT_MSGS.length), 3000)
      }
    }, 28)
    return () => clearInterval(t)
  }, [msgIdx])

  return (
    <main style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:1, opacity: visible ? 1 : 0, transition:'opacity 0.5s ease' }}>

      {/* Ambient blobs */}
      <div style={{ position:'fixed', bottom:'-10%', right:'-5%', width:'40%', height:'40%', background:'radial-gradient(ellipse,rgba(16,185,129,0.07),transparent 65%)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', top:'40%', left:'2%', width:'25%', height:'25%', background:'radial-gradient(ellipse,rgba(6,182,212,0.05),transparent 70%)', pointerEvents:'none', zIndex:0 }}/>

      {/* Nav */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        padding:'0.875rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(8,14,18,0.88)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(6,182,212,0.12)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#06b6d4,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', boxShadow:'0 0 20px rgba(6,182,212,0.4)' }}>
            📊
          </div>
          <div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', color:'var(--text)' }}>
              Talking <span style={{ color:'var(--accent)' }}>BI</span>
            </span>
            <div style={{ fontSize:'0.6rem', color:'var(--text-dim)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:-2 }}>
              AI Business Intelligence
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="badge badge-accent">⬡ System Online</span>
          <Link href="/dashboard">
            <button className="btn btn-primary" style={{ padding:'0.5rem 1.25rem', fontSize:'0.85rem' }}>
              Launch →
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:60, maxWidth:1000, width:'100%', alignItems:'center', marginTop:'7rem', padding:'2rem' }}>

        {/* Left */}
        <div>
          <div style={{ marginBottom:'1.25rem' }} className="animate-fade-in">
            <span className="badge badge-accent">⬡ Voice-Powered BI Platform</span>
          </div>

          <h1 className="display animate-slide-up" style={{ fontSize:'clamp(2.2rem,4vw,4rem)', lineHeight:1.06, marginBottom:'1.25rem', opacity:0, animationFillMode:'forwards' }}>
            Your data,{' '}
            <span className="gradient-text">talking back</span>
          </h1>

          <p className="animate-slide-up stagger-1" style={{ color:'var(--text-muted)', fontSize:'1.05rem', lineHeight:1.8, marginBottom:'2rem', fontWeight:300, opacity:0, animationFillMode:'forwards' }}>
            Upload any CSV. Speak your KPIs. Get instant AI-powered
            dashboards with insights — no analyst, no code, no waiting.
          </p>

          <div className="animate-slide-up stagger-2" style={{ display:'flex', gap:12, flexWrap:'wrap', opacity:0, animationFillMode:'forwards' }}>
            <Link href="/dashboard">
              <button className="btn btn-primary" style={{ fontSize:'1rem', padding:'0.875rem 2rem' }}>
                🚀 Upload your data
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="btn btn-ghost" style={{ fontSize:'1rem', padding:'0.875rem 2rem' }}>
                📊 Try demo
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-in stagger-3" style={{ display:'flex', gap:36, marginTop:'2.5rem', opacity:0, animationFillMode:'forwards' }}>
            {[
              { v:'Any CSV', l:'Data source', c:'#06b6d4' },
              { v:'< 30s',   l:'To dashboard',c:'#10b981' },
              { v:'Voice',   l:'AI chat',     c:'#34d399' },
              { v:'Free',    l:'Always',      c:'#22d3ee' },
            ].map(s => (
              <div key={s.l}>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.5rem', color:s.c, textShadow:`0 0 20px ${s.c}60` }}>{s.v}</p>
                <p style={{ fontSize:'0.72rem', color:'var(--text-dim)', marginTop:2, fontWeight:500 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Single robot */}
        <div className="animate-fade-in stagger-2" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, opacity:0, animationFillMode:'forwards' }}>

          {/* Main robot only */}
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:-24, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(6,182,212,0.12),transparent 70%)', animation:'glowPulse 3s ease infinite' }}/>
            <div className="animate-float">
              <Robot size="lg" color={botColor} label="BI-01" />
            </div>
          </div>

          {/* Speech bubble */}
          <div style={{
            maxWidth:240, padding:'12px 16px',
            background:'rgba(6,182,212,0.06)',
            border:'1px solid rgba(6,182,212,0.2)',
            borderRadius:'4px 16px 16px 16px',
            fontSize:'0.82rem', color:'#5eead4', lineHeight:1.6,
            minHeight:54, display:'flex', alignItems:'center',
            boxShadow:'0 4px 20px rgba(6,182,212,0.08)',
          }}>
            <span>{typed}</span>
            {typing && <span style={{ animation:'pulse 0.7s ease infinite', marginLeft:2, color:'var(--accent)', fontWeight:700 }}>|</span>}
          </div>

          {/* Color dots */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:'0.6rem', color:'var(--text-dim)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Color:</span>
            {['#06b6d4','#10b981','#34d399','#f59e0b','#ec4899'].map(c => (
              <div key={c} onClick={() => setBotColor(c)} style={{
                width:14, height:14, borderRadius:'50%', background:c,
                boxShadow:`0 0 8px ${c}80`, cursor:'pointer', transition:'all 0.2s',
                transform: botColor===c ? 'scale(1.4)' : 'scale(1)',
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, maxWidth:1000, width:'100%', padding:'0 2rem 3rem' }}>
        {FEATURES.map((f,i) => (
          <div key={f.title} className={`animate-slide-up stagger-${(i%5)+1}`} style={{
            background:'var(--bg-card)', border:`1px solid ${f.c1}18`,
            borderRadius:20, padding:'1.5rem 1rem', textAlign:'center',
            opacity:0, animationFillMode:'forwards', transition:'all 0.3s', cursor:'default',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = f.c1+'50'
            el.style.transform   = 'translateY(-6px)'
            el.style.boxShadow   = `0 16px 50px ${f.c1}12, 0 0 30px ${f.c1}08`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = f.c1+'18'
            el.style.transform   = 'translateY(0)'
            el.style.boxShadow   = 'none'
          }}>
            <div style={{ width:48, height:48, borderRadius:14, margin:'0 auto 1rem', background:f.c2, border:`1px solid ${f.c1}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>
              {f.icon}
            </div>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.88rem', marginBottom:'0.4rem', color:'var(--text)' }}>
              {f.title}
            </h3>
            <p style={{ color:'var(--text-muted)', fontSize:'0.76rem', lineHeight:1.6, fontWeight:300 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

    </main>
  )
}