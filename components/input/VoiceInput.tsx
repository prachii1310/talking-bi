'use client'
import { useState, useRef } from 'react'

interface Props {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceInput({ onTranscript, disabled }: Props) {
  const [listening, setListening] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const recognitionRef            = useRef<SpeechRecognition | null>(null)

  function startListening() {
    setError(null)

    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Your browser does not support voice input. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang           = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setListening(true)

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript
      onTranscript(transcript)
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(`Voice error: ${e.error}`)
      setListening(false)
    }

    recognition.onend = () => setListening(false)

    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <button
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        className={listening ? 'animate-pulse-ring' : ''}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: listening ? '#ef4444' : 'var(--accent)',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
          opacity: disabled ? 0.5 : 1,
        }}
        title={listening ? 'Click to stop' : 'Click to speak'}
      >
        {listening ? '⏹' : '🎤'}
      </button>

      <span style={{ fontSize: '0.78rem', color: listening ? '#ef4444' : 'var(--text-dim)' }}>
        {listening ? 'Listening… click to stop' : 'Click to speak'}
      </span>

      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--danger)', textAlign: 'center', maxWidth: 200 }}>
          {error}
        </span>
      )}
    </div>
  )
}