'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import type { Metadata } from 'next'
import './globals.css'

// Peek-a-boo robot that appears between page transitions
function PeekRobot({ visible }: { visible: boolean }) {
  return (
    <div style={{
      position:   'fixed',
      bottom:     visible ? 24 : -120,
      right:      32,
      zIndex:     9999,
      transition: 'bottom 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      display:    'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap:        6,
      pointerEvents: 'none',
    }}>
      {/* Speech bubble */}
      <div style={{
        background:   'rgba(13,21,32,0.95)',
        border:       '1px solid rgba(6,182,212,0.3)',
        borderRadius: '12px 12px 12px 4px',
        padding:      '8px 14px',
        fontSize:     '0.75rem',
        color:        '#5eead4',
        whiteSpace:   'nowrap',
        boxShadow:    '0 4px 20px rgba(6,182,212,0.15)',
        opacity:      visible ? 1 : 0,
        transition:   'opacity 0.3s ease 0.2s',
      }}>
        Loading next page... ✨
      </div>
      {/* Robot */}
      <div style={{
        width:60, height:70, borderRadius:14,
        background:'linear-gradient(160deg,rgba(6,182,212,0.18),rgba(6,182,212,0.06))',
        border:'1.5px solid rgba(6,182,212,0.4)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:7, position:'relative', overflow:'hidden',
        boxShadow:'0 0 30px rgba(6,182,212,0.25)',
      }}>
        <div style={{ position:'absolute', left:0, right:0, height:1.5, background:'linear-gradient(90deg,transparent,rgba(6,182,212,0.7),transparent)', animation:'scanLine 1.5s linear infinite', top:0 }}/>
        <div style={{ position:'absolute', top:-6, width:2, height:10, background:'#06b6d4', borderRadius:99 }}>
          <div style={{ position:'absolute', top:-4, left:'50%', transform:'translateX(-50%)', width:5, height:5, borderRadius:'50%', background:'#06b6d4', boxShadow:'0 0 8px #06b6d4', animation:'glowPulse 1s ease infinite' }}/>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {[0,1].map(i => (
            <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#06b6d4', boxShadow:'0 0 8px #06b6d4', animation:'glowPulse 1s ease infinite', animationDelay:`${i*0.2}s` }}/>
          ))}
        </div>
        <div style={{ width:30, height:4, borderRadius:99, background:'rgba(6,182,212,0.15)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:'55%', borderRadius:99, background:'#06b6d4', animation:'scan 1s ease infinite' }}/>
        </div>
      </div>
    </div>
  )
}

// Page wrapper with slide-in animation
function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [show,    setShow]    = useState(false)
  const [peeking, setPeeking] = useState(false)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (prevPath.current !== pathname) {
      // Peek-a-boo robot appears briefly
      setPeeking(true)
      setShow(false)
      const t1 = setTimeout(() => { setPeeking(false); setShow(true) }, 600)
      prevPath.current = pathname
      return () => clearTimeout(t1)
    } else {
      // First load
      const t = setTimeout(() => setShow(true), 60)
      return () => clearTimeout(t)
    }
  }, [pathname])

  return (
    <>
      <div style={{
        opacity:    show ? 1 : 0,
        transform:  show ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.99)',
        transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)',
        minHeight:  '100vh',
      }}>
        {children}
      </div>
      <PeekRobot visible={peeking} />
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageWrapper>
          {children}
        </PageWrapper>
      </body>
    </html>
  )
}