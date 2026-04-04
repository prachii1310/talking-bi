export interface KPI {
  id:          string
  name:        string
  description: string
  unit:        string
  target?:     number
  actual?:     number
  trend?:      'up' | 'down' | 'flat'
}

export interface KPICoverage {
  requested:  KPI[]
  covered:    KPI[]
  missing:    KPI[]
  percentage: number
}

export interface UserKPIInput {
  kpiNames:       string[]
  numberOfCharts: number
  colorSchema?:   string
  collection:     string
}