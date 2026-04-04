// app/api/ai/extract-kpi/route.ts
// Receives user KPI names + data sample → Claude returns structured KPI configs

import { NextRequest, NextResponse } from 'next/server'
import { askClaudeJSON }             from '@/lib/anthropic'
import { KPI_EXTRACTION_PROMPT }     from '@/lib/prompts'
import { getDb }                     from '@/lib/mongodb'
import { cleanData }                 from '@/lib/data-cleaner'

interface ExtractKPIRequest {
  kpiNames:   string[]
  collection: string
}

interface KPIConfig {
  id:          string
  name:        string
  column:      string
  unit:        string
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min'
  description: string
}

interface SuggestedChart {
  kpiId:     string
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'
  title:     string
  groupBy:   string
  reasoning: string
}

interface ClaudeKPIResponse {
  kpis:            KPIConfig[]
  suggestedCharts: SuggestedChart[]
  dataInsights:    string
}

export async function POST(req: NextRequest) {
  try {
    const { kpiNames, collection } = await req.json() as ExtractKPIRequest

    if (!kpiNames?.length || !collection) {
      return NextResponse.json(
        { error: 'Missing kpiNames or collection' },
        { status: 400 }
      )
    }

    // Step 1 — fetch a sample of the data from MongoDB
    const db      = await getDb()
    const rawData = await db.collection(collection).find({}).limit(20).toArray()

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: `Collection "${collection}" is empty.` },
        { status: 400 }
      )
    }

    // Step 2 — clean the data and get column names
    const withoutId = rawData.map(({ _id, ...rest }) => rest)
    const { rows, schema } = cleanData(withoutId)

    const columnNames   = Object.keys(schema)
    const sampleRows    = rows.slice(0, 5)

    // Step 3 — build the message for Claude
    const userMessage = `
User wants to track these KPIs: ${kpiNames.join(', ')}

Available columns in the data: ${columnNames.join(', ')}

Sample data (first 5 rows):
${JSON.stringify(sampleRows, null, 2)}

Match the requested KPIs to the available columns and suggest the best charts.
`

    // Step 4 — ask Claude
    // Try up to 2 times in case of bad JSON
    let result: ClaudeKPIResponse | null = null
    for (let attempt = 0; attempt < 2; attempt++) {
    try {
        result = await askClaudeJSON<ClaudeKPIResponse>(
        KPI_EXTRACTION_PROMPT,
        userMessage,
        2048
        )
        break
    } catch (jsonErr) {
        if (attempt === 1) throw new Error('AI returned invalid JSON twice. Try simpler KPI names.')
    }
    }
    if (!result) throw new Error('AI extraction failed')

    // Step 5 — return everything the frontend needs
    return NextResponse.json({
      success:      true,
      kpis:         result.kpis,
      suggestedCharts: result.suggestedCharts,
      dataInsights: result.dataInsights,
      columnNames,
      totalRows:    rawData.length,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[extract-kpi] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}