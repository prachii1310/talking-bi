'use client'
import { useState } from 'react'
import type { DashboardLayout } from '@/types/dashboard'

const STYLE_META: Record<string, { icon: string; color: string; glow: string; tag: string }> = {
  'overview':   { icon: '🗂', color: '#6366f1', glow: 'rgba(99,102,241,0.3)',  tag: 'Full Picture'   },
  'kpi-focus':  { icon: '🎯', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', tag: 'KPI Deep Dive'  },
  'trend':      { icon: '📈', color: '#10b981', glow: 'rgba(16,185,129,0.3)', tag: 'Trend Analysis'  },
  'comparison': { icon: '⚖️', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', tag: 'Comparison'     },
}

const CHART_ICONS: Record<string, string> = {
  bar: '▊', line: '∿', pie: '◔', doughnut: '◎', radar: '⬡',
}

export default function DashboardPreview({
  layout, selected, onSelect, index,
}: {
  layout:   DashboardLayout
  selected: boolean
  onSelect: (id: string) => void
  index:    number
}) {
  const [hovered, setHovered] = useState(false)
  const meta = STYLE_META[layout.style] ?? STYLE_META['overview']
  const active = selected || hovered

  return (
    <div
      onClick={() => onSelect(layout.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-slide-up"
      style={{
        animationDelay:    `${index * 0.08}s`,
        animationFillMode: 'forwards',
        opacity:           0,
        cursor:            'pointer',
        borderRadius:      20,
        padding:           2,
        background:        active
          ? `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`
          : 'var(--border)',
        transition:        'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow:         active ? `0 0 40px ${meta.glow}, 0 20px 60px rgba(0,0,0,0.4)` : 'none',
        transform:         active ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
    >
      <div style={{
        background:   'var(--bg-card)',
        borderRadius: 18,
        padding:      '1.5rem',
        height:       '100%',
        position:     'relative',
        overflow:     'hidden',
      }}>

        {/* Glow orb behind card */}
        <div style={{
          position:   'absolute',
          top:        -40, right: -40,
          width:      140, height: 140,
          borderRadius: '50%',
          background: meta.color,
          opacity:    active ? 0.08 : 0,
          transition: 'opacity 0.4s',
          filter:     'blur(30px)',
          pointerEvents: 'none',
        }} />

        {/* Selected checkmark */}
        {selected && (
          <div style={{
            position:       'absolute',
            top:            14, right: 14,
            width:          26, height: 26,
            borderRadius:   '50%',
            background:     meta.color,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '0.75rem',
            color:          '#fff',
            fontWeight:     700,
            boxShadow:      `0 0 12px ${meta.glow}`,
            animation:      'fadeIn 0.2s ease',
          }}>
            ✓
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{
            width:          48, height: 48,
            borderRadius:   14,
            background:     `${meta.color}20`,
            border:         `1px solid ${meta.color}40`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '1.4rem',
            flexShrink:     0,
            transition:     'all 0.3s',
            boxShadow:      active ? `0 0 20px ${meta.glow}` : 'none',
          }}>
            {meta.icon}
          </div>
          <div style={{ flex: 1, paddingRight: selected ? 30 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize:   '1rem',
                color:      active ? '#fff' : 'var(--text)',
                transition: 'color 0.3s',
              }}>
                {layout.title}
              </h3>
              <span style={{
                fontSize:   '0.65rem',
                padding:    '2px 8px',
                borderRadius: 99,
                background: `${meta.color}25`,
                color:      meta.color,
                fontWeight: 600,
                border:     `1px solid ${meta.color}40`,
              }}>
                {meta.tag}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              {layout.description}
            </p>
          </div>
        </div>

        {/* Chart list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {layout.charts.map((chart, i) => (
            <div key={chart.id} style={{
              display:      'flex',
              alignItems:   'center',
              gap:          10,
              padding:      '8px 12px',
              borderRadius: 10,
              background:   active ? `${meta.color}10` : 'rgba(255,255,255,0.03)',
              border:       `1px solid ${active ? meta.color + '25' : 'var(--border)'}`,
              transition:   'all 0.25s',
              animationDelay: `${i * 0.05}s`,
            }}>
              <span style={{
                fontSize:       '0.9rem',
                width:          20,
                textAlign:      'center',
                color:          meta.color,
                opacity:        active ? 1 : 0.5,
                transition:     'opacity 0.3s',
                flexShrink:     0,
              }}>
                {CHART_ICONS[chart.type] ?? '◈'}
              </span>
              <span style={{
                flex:      1,
                fontSize:  '0.8rem',
                color:     'var(--text-muted)',
                overflow:  'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {chart.title}
              </span>
              <span style={{
                fontSize:     '0.65rem',
                padding:      '2px 7px',
                borderRadius: 99,
                background:   active ? `${meta.color}20` : 'var(--bg-hover)',
                color:        active ? meta.color : 'var(--text-dim)',
                fontWeight:   500,
                transition:   'all 0.25s',
                flexShrink:   0,
              }}>
                {chart.type}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop:      14,
          paddingTop:     12,
          borderTop:      `1px solid ${active ? meta.color + '30' : 'var(--border)'}`,
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          transition:     'border-color 0.3s',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {layout.columns}-col · {layout.charts.length} charts
          </span>
          <span style={{
            fontSize:   '0.75rem',
            color:      active ? meta.color : 'var(--text-dim)',
            fontWeight: 500,
            transition: 'color 0.3s',
          }}>
            {selected ? '✦ Selected' : hovered ? 'Click to select →' : 'Hover to preview'}
          </span>
        </div>
      </div>
    </div>
  )
}