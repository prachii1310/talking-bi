'use client'
import { useState } from 'react'
import { speakText } from '@/components/chat/VoiceOutput'

interface Props {
  summary:  string
  loading?: boolean
}

export default function InsightSummary({ summary, loading }: Props) {
  const [speaking, setSpeaking] = useState(false)

  function toggleSpeak() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    } else {
      speakText(summary)
      setSpeaking(true)
      // Reset speaking state when done
      const u    = new SpeechSynthesisUtterance(summary)
      u.onend    = () => setSpeaking(false)
      u.onerror  = () => setSpeaking(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        background:   'var(--bg-card)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding:      '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:          7, height: 7,
                borderRadius:   '50%',
                background:     'var(--accent)',
                animation:      'pulse 1.2s ease infinite',
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Generating insight summary…
          </span>
        </div>
      </div>
    )
  }

  if (!summary) return null

  // Parse the summary into sections
  const lines = summary.split('\n').filter(Boolean)

  return (
    <div style={{
      background:   'var(--bg-card)',
      border:       '1px solid var(--border)',
      borderLeft:   '3px solid var(--accent)',
      borderRadius: 'var(--radius-lg)',
      padding:      '1.25rem',
      animation:    'fadeIn 0.4s ease',
    }}>
      {/* Header */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   14,
      }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
          🤖 AI Insight Summary
        </h3>
        <button
          onClick={toggleSpeak}
          title={speaking ? 'Stop' : 'Read aloud'}
          style={{
            background: 'transparent',
            border:     'none',
            cursor:     'pointer',
            fontSize:   '1rem',
            color:      speaking ? 'var(--accent)' : 'var(--text-dim)',
          }}
        >
          {speaking ? '🔊' : '🔈'}
        </button>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lines.map((line, i) => {
          // Bullet points
          if (line.startsWith('•') || line.startsWith('-') || line.match(/^\d\./)) {
            return (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>▸</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {line.replace(/^[•\-\d\.]\s*/, '')}
                </p>
              </div>
            )
          }
          // Headline — first line
          if (i === 0) {
            return (
              <p key={i} style={{
                fontSize:     '0.95rem',
                fontWeight:   600,
                color:        'var(--text)',
                lineHeight:   1.5,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border)',
                marginBottom: 4,
              }}>
                {line}
              </p>
            )
          }
          // Regular line
          return (
            <p key={i} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}