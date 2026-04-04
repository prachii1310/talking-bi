// lib/anthropic.ts
// Using Groq instead of Anthropic — same interface, free tier

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY in .env.local')
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile' // best free model on Groq

// ── Core function — call Groq, get plain text back ──────────────────
export async function askClaude(
  systemPrompt: string,
  userMessage:  string,
  maxTokens = 1024
): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system',  content: systemPrompt },
        { role: 'user',    content: userMessage  },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content

  if (!text) throw new Error('Empty response from Groq')
  return text
}

// ── JSON variant — call Groq, parse JSON response ───────────────────
export async function askClaudeJSON<T>(
  systemPrompt: string,
  userMessage:  string,
  maxTokens = 1024
): Promise<T> {
  const raw   = await askClaude(systemPrompt, userMessage, maxTokens)
  const clean = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    return JSON.parse(clean) as T
  } catch {
    // Sometimes the model adds extra text before/after JSON — extract it
    const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0]) as T
    throw new Error(`Could not parse JSON from Groq response: ${clean.slice(0, 200)}`)
  }
}

// Export model name for reference
export const AI_MODEL = GROQ_MODEL