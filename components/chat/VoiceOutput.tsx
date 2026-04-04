'use client'
import { useState } from 'react'

interface Props {
  text:      string
  autoSpeak?: boolean
}

export default function VoiceOutput({ text, autoSpeak }: Props) {
  const [speaking, setSpeaking] = useState(false)

  function speak() {
    if (!text || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const u       = new SpeechSynthesisUtterance(text)
    u.rate        = 1
    u.pitch       = 1
    u.volume      = 1
    u.onstart     = () => setSpeaking(true)
    u.onend       = () => setSpeaking(false)
    u.onerror     = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  function stop() {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  if (!text) return null

  return (
    <button
      onClick={speaking ? stop : speak}
      title={speaking ? 'Stop speaking' : 'Read aloud'}
      style={{
        background:   'transparent',
        border:       'none',
        cursor:       'pointer',
        fontSize:     '1rem',
        padding:      '4px',
        borderRadius: 6,
        color:        speaking ? 'var(--accent)' : 'var(--text-dim)',
        transition:   'color 0.15s',
      }}
    >
      {speaking ? '🔊' : '🔈'}
    </button>
  )
}

// Standalone helper — call this anywhere to speak text
export function speakText(text: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate  = 1
  window.speechSynthesis.speak(u)
}