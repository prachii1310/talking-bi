'use client'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2'
import type { ChartConfig } from '@/types/dashboard'

// Register all Chart.js components once
ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
)

const BASE_OPTIONS = {
  responsive:          true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color:    '#9090a8',
        font:     { size: 12 },
        boxWidth: 12,
      },
    },
    tooltip: {
      backgroundColor: '#16161d',
      titleColor:      '#f0f0f5',
      bodyColor:       '#9090a8',
      borderColor:     '#2e2e3e',
      borderWidth:     1,
      padding:         10,
    },
  },
  scales: {
    x: {
      ticks: { color: '#9090a8', font: { size: 11 } },
      grid:  { color: '#232330' },
    },
    y: {
      ticks: { color: '#9090a8', font: { size: 11 } },
      grid:  { color: '#232330' },
    },
  },
}

// Pie/Doughnut/Radar don't use x/y scales
const NO_SCALE_OPTIONS = {
  responsive:          true,
  maintainAspectRatio: false,
  plugins: BASE_OPTIONS.plugins,
}

export default function ChartRenderer({ chart }: { chart: ChartConfig }) {
  const height = 260

  const chartEl = (() => {
    switch (chart.type) {
      case 'bar':
        return (
          <Bar
            data={chart.data}
            options={{
              ...BASE_OPTIONS,
              plugins: {
                ...BASE_OPTIONS.plugins,
                title: { display: false },
              },
            }}
          />
        )
      case 'line':
        return (
          <Line
            data={{
              ...chart.data,
              datasets: chart.data.datasets.map(ds => ({
                ...ds,
                tension:       0.4,
                fill:          true,
                backgroundColor: typeof ds.backgroundColor === 'string'
                  ? ds.backgroundColor.replace('99', '22')
                  : ds.backgroundColor,
              })),
            }}
            options={BASE_OPTIONS}
          />
        )
      case 'pie':
        return <Pie      data={chart.data} options={NO_SCALE_OPTIONS} />
      case 'doughnut':
        return <Doughnut data={chart.data} options={NO_SCALE_OPTIONS} />
      case 'radar':
        return (
          <Radar
            data={chart.data}
            options={{
              ...NO_SCALE_OPTIONS,
              scales: {
                r: {
                  ticks:     { color: '#9090a8', font: { size: 10 }, backdropColor: 'transparent' },
                  grid:      { color: '#232330' },
                  pointLabels: { color: '#9090a8', font: { size: 11 } },
                },
              },
            }}
          />
        )
      default:
        return <Bar data={chart.data} options={BASE_OPTIONS} />
    }
  })()

  return (
    <div style={{
      background:    'var(--bg-card)',
      border:        '1px solid var(--border)',
      borderRadius:  'var(--radius-lg)',
      padding:       '1.25rem',
      display:       'flex',
      flexDirection: 'column',
      gap:           12,
    }}>
      {/* Chart header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>
            {chart.title}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            KPI: {chart.kpi}
          </span>
        </div>
        <span style={{
          fontSize:     '0.72rem',
          padding:      '3px 8px',
          borderRadius: 99,
          background:   'var(--accent-dim)',
          color:        'var(--accent)',
          fontWeight:   500,
        }}>
          {chart.type}
        </span>
      </div>

      {/* Chart canvas */}
      <div style={{ height, position: 'relative' }}>
        {chartEl}
      </div>
    </div>
  )
}