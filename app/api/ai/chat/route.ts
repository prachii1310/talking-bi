import { NextRequest, NextResponse } from 'next/server'
import { askClaude }           from '@/lib/anthropic'
import { CHAT_PROMPT }         from '@/lib/prompts'

interface ChatRequest {
  message:        string
  context:        string
  dashboardTitle: string
  history:        { role: string; content: string }[]
}

export async function POST(req: NextRequest) {
  try {
    const { message, context, dashboardTitle, history } =
      await req.json() as ChatRequest

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // Build full message with history for context
    const historyText = history.length > 0
      ? '\n\nConversation so far:\n' +
        history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
      : ''

    const userMessage = `${historyText}\n\nUser: ${message}`

    const reply = await askClaude(
      CHAT_PROMPT(dashboardTitle, context),
      userMessage,
      512
    )

    return NextResponse.json({ success: true, reply })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[chat] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}