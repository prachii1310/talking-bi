'use client'
import { useState, useRef, useEffect } from 'react'
import ChatMessageBubble from './ChatMessage'
import VoiceOutput, { speakText } from './VoiceOutput'
import VoiceInput        from '@/components/input/VoiceInput'
import type { ChatMessage }  from '@/types/message'
import type { DashboardLayout } from '@/types/dashboard'

interface Props {
  layout:      DashboardLayout
  collection:  string
}

export default function ChatBox({ layout, collection }: Props) {
  const [messages,  setMessages]  = useState<ChatMessage[]>([
    {
      id:        'welcome',
      role:      'assistant',
      content:   `Hi! I'm your BI assistant for the "${layout.title}" dashboard. Ask me anything about your data — trends, top products, comparisons, or insights.`,
      timestamp: new Date().toISOString(),
    }
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Build data context string from the layout charts
  function buildDataContext(): string {
    const lines: string[] = []
    for (const chart of layout.charts) {
      const dataset = chart.data.datasets[0]
      if (!dataset) continue
      const values = dataset.data as number[]
      const labels = chart.data.labels as string[]
      const total  = values.reduce((a, b) => a + b, 0)
      const max    = Math.max(...values)
      const maxIdx = values.indexOf(max)
      lines.push(
        `${chart.title}: total=${total.toFixed(0)}, ` +
        `highest=${labels[maxIdx]}(${max.toFixed(0)}), ` +
        `data=[${labels.map((l, i) => `${l}:${values[i]}`).join(', ')}]`
      )
    }
    return lines.join('\n')
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id:        Date.now().toString(),
      role:      'user',
      content:   text.trim(),
      timestamp: new Date().toISOString(),
    }

    const loadingMsg: ChatMessage = {
      id:        'loading',
      role:      'assistant',
      content:   '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:     text.trim(),
          context:     buildDataContext(),
          dashboardTitle: layout.title,
          history:     messages.slice(-6).map(m => ({
            role:    m.role,
            content: m.content,
          })),
        }),
      })

      const json = await res.json()

      if (!res.ok || json.error) throw new Error(json.error || 'Chat failed')

      const reply = json.reply as string

      // Replace loading bubble with real reply
      setMessages(prev => prev.map(m =>
        m.id === 'loading'
          ? { ...m, id: Date.now().toString(), content: reply, isLoading: false }
          : m
      ))

      // Auto speak the reply if enabled
      if (autoSpeak) speakText(reply)

    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === 'loading'
          ? { ...m, id: Date.now().toString(), content: `Error: ${err.message}`, isLoading: false }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }

  function handleVoice(transcript: string) {
    setInput(transcript)
    sendMessage(transcript)
  }

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      background:    'var(--bg-card)',
      border:        '1px solid var(--border)',
      borderRadius:  'var(--radius-lg)',
      overflow:      'hidden',
    }}>

      {/* Chat header */}
      <div style={{
        padding:        '1rem 1.25rem',
        borderBottom:   '1px solid var(--border)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            💬 Chat with your data
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {layout.title} · {layout.charts.length} charts
          </p>
        </div>

        {/* Auto-speak toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔊 Auto-speak
          </span>
          <div
            onClick={() => setAutoSpeak(p => !p)}
            style={{
              width:        36,
              height:       20,
              borderRadius: 99,
              background:   autoSpeak ? 'var(--accent)' : 'var(--border-light)',
              position:     'relative',
              cursor:       'pointer',
              transition:   'background 0.2s',
            }}
          >
            <div style={{
              position:   'absolute',
              top:        2,
              left:       autoSpeak ? 18 : 2,
              width:      16,
              height:     16,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
            }} />
          </div>
        </label>
      </div>

      {/* Messages */}
      <div style={{
        flex:       1,
        overflowY:  'auto',
        padding:    '1.25rem',
        display:    'flex',
        flexDirection: 'column',
      }}>
        {messages.map(msg => (
          <div key={msg.id}>
            <ChatMessageBubble msg={msg} />
            {/* Speak button on AI messages */}
            {msg.role === 'assistant' && !msg.isLoading && msg.id !== 'welcome' && (
              <div style={{ marginTop: -10, marginBottom: 8, paddingLeft: 40 }}>
                <VoiceOutput text={msg.content} />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div style={{ padding: '0 1.25rem 1rem', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            'What is the total revenue?',
            'Which month had the highest profit?',
            'What are the top performing categories?',
            'Give me a full summary',
          ].map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              style={{
                padding:      '5px 12px',
                borderRadius: 99,
                border:       '1px solid var(--border-light)',
                background:   'transparent',
                color:        'var(--text-muted)',
                fontSize:     '0.78rem',
                cursor:       'pointer',
                transition:   'all 0.15s',
              }}
              onMouseEnter={e => {
                const t = e.target as HTMLButtonElement
                t.style.background = 'var(--accent-dim)'
                t.style.color      = 'var(--accent)'
                t.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={e => {
                const t = e.target as HTMLButtonElement
                t.style.background  = 'transparent'
                t.style.color       = 'var(--text-muted)'
                t.style.borderColor = 'var(--border-light)'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{
        padding:     '1rem 1.25rem',
        borderTop:   '1px solid var(--border)',
        display:     'flex',
        gap:         10,
        alignItems:  'center',
      }}>
        <VoiceInput onTranscript={handleVoice} disabled={loading} />
        <input
          className="input"
          placeholder="Ask anything about your data…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{ opacity: loading || !input.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
        >
          {loading ? '…' : 'Send →'}
        </button>
      </div>

    </div>
  )
}