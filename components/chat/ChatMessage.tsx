import type { ChatMessage } from '@/types/message'

export default function ChatMessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'

  return (
    <div style={{
      display:       'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems:    'flex-end',
      gap:           8,
      marginBottom:  16,
      animation:     'slideUp 0.2s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width:          32,
        height:         32,
        borderRadius:   '50%',
        background:     isUser ? 'var(--accent)' : 'var(--bg-hover)',
        border:         '1px solid var(--border)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '0.85rem',
        flexShrink:     0,
      }}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth:     '75%',
        padding:      '10px 14px',
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        background:   isUser ? 'var(--accent)' : 'var(--bg-card)',
        border:       isUser ? 'none' : '1px solid var(--border)',
        fontSize:     '0.9rem',
        lineHeight:   1.6,
        color:        isUser ? '#fff' : 'var(--text)',
        whiteSpace:   'pre-wrap',
        wordBreak:    'break-word',
      }}>
        {/* Loading dots */}
        {msg.isLoading ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width:            7,
                height:           7,
                borderRadius:     '50%',
                background:       'var(--text-muted)',
                animation:        'pulse 1.2s ease infinite',
                animationDelay:   `${i * 0.2}s`,
              }} />
            ))}
          </div>
        ) : (
          msg.content
        )}
      </div>

      {/* Timestamp */}
      <span style={{
        fontSize:   '0.68rem',
        color:      'var(--text-dim)',
        flexShrink: 0,
        alignSelf:  'flex-end',
        marginBottom: 2,
      }}>
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}