// app/api/ai/generate-dashboard/route.ts
// Takes KPI configs → fetches real data → computes chart data → returns 3 dashboard layouts

import { NextRequest, NextResponse } from 'next/server'
import { getDb }                     from '@/lib/mongodb'
import { cleanData }                 from '@/lib/data-cleaner'
import type { ChartConfig, DashboardLayout } from '@/types/dashboard'

interface GenerateRequest {
  kpis:            any[]
  suggestedCharts: any[]
  collection:      string
  colorSchema:     string
  numberOfCharts:  number
}

// Color palettes per theme
const PALETTES: Record<string, string[]> = {
  blue:   ['#6366f1','#818cf8','#a5b4fc','#c7d2fe','#4f46e5','#3730a3'],
  green:  ['#22c55e','#4ade80','#86efac','#16a34a','#15803d','#166534'],
  orange: ['#f59e0b','#fbbf24','#fcd34d','#d97706','#b45309','#92400e'],
  red:    ['#ef4444','#f87171','#fca5a5','#dc2626','#b91c1c','#991b1b'],
  purple: ['#a855f7','#c084fc','#d8b4fe','#9333ea','#7e22ce','#6b21a8'],
}

export async function POST(req: NextRequest) {
  try {
    const { kpis, suggestedCharts, collection, colorSchema, numberOfCharts } =
      await req.json() as GenerateRequest

    const palette = PALETTES[colorSchema] ?? PALETTES.blue

    // Fetch full data from MongoDB
    const db      = await getDb()
    const rawData = await db.collection(collection).find({}).limit(500).toArray()
    const withoutId = rawData.map(({ _id, ...rest }) => rest)
    const { rows } = cleanData(withoutId)

    // Build chart configs from suggestedCharts
    // If Claude returned fewer charts than requested, duplicate with different groupBy
    let chartsToUse = [...suggestedCharts]

    if (chartsToUse.length < numberOfCharts) {
    const groupByOptions = ['category', 'region', 'segment', 'month', 'city', 'state', 'sub_category', 'ship_mode']
    const chartTypes     = ['bar', 'line', 'pie', 'doughnut', 'radar']

    while (chartsToUse.length < numberOfCharts) {
        const base    = suggestedCharts[chartsToUse.length % suggestedCharts.length]
        const kpi     = kpis[chartsToUse.length % kpis.length]
        const newGroupBy = groupByOptions.find(g =>
        !chartsToUse.find(c => c.groupBy === g) && g !== base.groupBy
        ) ?? groupByOptions[chartsToUse.length % groupByOptions.length]

        chartsToUse.push({
        ...base,
        kpiId:     kpi.id,
        chartType: chartTypes[chartsToUse.length % chartTypes.length],
        title:     `${kpi.name} by ${newGroupBy.replace('_',' ')}`,
        groupBy:   newGroupBy,
        })
    }
    }

    chartsToUse = chartsToUse.slice(0, numberOfCharts)
    const chartConfigs: ChartConfig[] = []

    for (const suggested of chartsToUse) {
      const kpi = kpis.find((k: any) => k.id === suggested.kpiId)
      if (!kpi) continue

      const chartData = computeChartData(
        rows,
        kpi,
        suggested,
        palette
      )

      if (!chartData) continue

      chartConfigs.push({
        id:    `chart_${suggested.kpiId}`,
        type:  suggested.chartType,
        title: suggested.title,
        kpi:   kpi.name,
        color: palette[0],
        data:  chartData,
      })
    }

    if (chartConfigs.length === 0) {
      return NextResponse.json(
        { error: 'Could not compute any charts. Check your collection and KPI columns.' },
        { status: 400 }
      )
    }

    // Build 3 layout options
    const chartIds = chartConfigs.map(c => c.id)

    const layouts: DashboardLayout[] = [
      {
        id:          'layout_1',
        style:       'overview',
        title:       'Business Overview',
        description: 'A complete view of all your key metrics at a glance',
        columns:     2,
        charts:      chartConfigs,
      },
      {
        id:          'layout_2',
        style:       'kpi-focus',
        title:       'KPI Deep Dive',
        description: 'Focused analysis on your most important KPIs',
        columns:     2,
        charts:      [...chartConfigs].reverse(),
      },
      {
        id:          'layout_3',
        style:       'trend',
        title:       'Trend Analysis',
        description: 'How your metrics are changing over time',
        columns:     1,
        charts:      chartConfigs.filter(c =>
          c.type === 'line' || c.type === 'bar'
        ).concat(chartConfigs.filter(c =>
          c.type !== 'line' && c.type !== 'bar'
        )),
      },
    ]

    return NextResponse.json({
      success: true,
      layouts,
      chartCount: chartConfigs.length,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-dashboard] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── Data computation ────────────────────────────────────────────────────

function computeChartData(
  rows:      any[],
  kpi:       any,
  suggested: any,
  palette:   string[]
): ChartConfig['data'] | null {
  try {
    const groupBy = suggested.groupBy
    const column  = kpi.column
    const aggType = kpi.aggregation

    // Group rows by the groupBy column
    const grouped: Record<string, number[]> = {}

    for (const row of rows) {
      const groupKey = String(row[groupBy] ?? 'Unknown')
      const rawVal   = row[column]
      const val      = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal))

      if (isNaN(val)) continue

      if (!grouped[groupKey]) grouped[groupKey] = []
      grouped[groupKey].push(val)
    }

    if (Object.keys(grouped).length === 0) return null

    // Sort labels — months get special ordering
    const MONTH_ORDER = ['January','February','March','April','May','June','July','August','September','October','November','December']
    let labels = Object.keys(grouped)

    if (labels.some(l => MONTH_ORDER.includes(l))) {
      labels = labels.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b))
    } else {
      labels = labels.sort()
    }

    // Aggregate values
    const data = labels.map(label => {
      const vals = grouped[label]
      switch (aggType) {
        case 'sum':   return Math.round(vals.reduce((a, b) => a + b, 0))
        case 'avg':   return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        case 'count': return vals.length
        case 'max':   return Math.max(...vals)
        case 'min':   return Math.min(...vals)
        default:      return Math.round(vals.reduce((a, b) => a + b, 0))
      }
    })

    // For pie/doughnut — use multiple colors
    const isPie = suggested.chartType === 'pie' || suggested.chartType === 'doughnut'
    const bgColors = isPie
      ? labels.map((_, i) => palette[i % palette.length])
      : palette[0] + '99'  // slight transparency for bar/line

    const borderColors = isPie
      ? labels.map((_, i) => palette[i % palette.length])
      : palette[0]

    return {
      labels,
      datasets: [{
        label:           `${kpi.name} (${aggType})`,
        data,
        backgroundColor: bgColors,
        borderColor:     borderColors,
        borderWidth:     suggested.chartType === 'line' ? 2 : 1,
      }],
    }

  } catch {
    return null
  }
}