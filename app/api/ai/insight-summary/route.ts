import { NextRequest, NextResponse } from 'next/server'
import { askClaude }             from '@/lib/anthropic'
import { INSIGHT_SUMMARY_PROMPT } from '@/lib/prompts'
import { calculateKPICoverage, parseKPINames } from '@/lib/kpi-tracker'

interface InsightRequest {
  dashboardTitle: string
  charts:         any[]
  kpiNames:       string[]
  columnNames:    string[]
}

export async function POST(req: NextRequest) {
  try {
    const { dashboardTitle, charts, kpiNames, columnNames } =
      await req.json() as InsightRequest

    // Calculate KPI coverage
    const requestedKPIs = parseKPINames(kpiNames)
    const coverage      = calculateKPICoverage(requestedKPIs, columnNames)

    // Build data summary for Claude
    const dataSummary = charts.map(chart => {
      const dataset = chart.data?.datasets?.[0]
      if (!dataset) return ''
      const values  = dataset.data as number[]
      const labels  = chart.data.labels as string[]
      const total   = values.reduce((a: number, b: number) => a + b, 0)
      const max     = Math.max(...values)
      const maxIdx  = values.indexOf(max)
      const min     = Math.min(...values)
      const minIdx  = values.indexOf(min)
      return (
        `${chart.title}:\n` +
        `  Total: ${total.toFixed(0)}\n` +
        `  Highest: ${labels[maxIdx]} = ${max.toFixed(0)}\n` +
        `  Lowest: ${labels[minIdx]} = ${min.toFixed(0)}\n` +
        `  Data points: ${values.length}`
      )
    }).filter(Boolean).join('\n\n')

    const userMessage = `
Dashboard: "${dashboardTitle}"
KPI Coverage: ${coverage.percentage}% (${coverage.covered.length}/${coverage.requested.length} KPIs found)

Data Summary:
${dataSummary}

Generate a concise business insight report.
`

    const summary = await askClaude(
      INSIGHT_SUMMARY_PROMPT,
      userMessage,
      400
    )

    return NextResponse.json({
      success:  true,
      summary,
      coverage: {
        percentage: coverage.percentage,
        covered:    coverage.covered,
        missing:    coverage.missing,
        requested:  coverage.requested,
      },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[insight-summary] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}