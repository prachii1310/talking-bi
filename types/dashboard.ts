export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'

export interface ChartConfig {
  id:    string
  type:  ChartType
  title: string
  kpi:   string
  color: string
  data:  {
    labels:   string[]
    datasets: {
      label:           string
      data:            number[]
      backgroundColor: string | string[]
      borderColor:     string | string[]
      borderWidth:     number
    }[]
  }
}

export type LayoutStyle = 'overview' | 'kpi-focus' | 'trend' | 'comparison'

export interface DashboardLayout {
  id:          string
  style:       LayoutStyle
  title:       string
  description: string
  charts:      ChartConfig[]
  columns:     1 | 2 | 3
}

export interface GeneratedDashboard {
  layouts:     DashboardLayout[]
  selectedId:  string | null
  kpiCoverage: number
  generatedAt: string
}