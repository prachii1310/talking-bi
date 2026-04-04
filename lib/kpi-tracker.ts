import type { KPI, KPICoverage } from '@/types/kpi'

function isKPICovered(kpi: KPI, columns: string[]): boolean {
  const kpiLower = kpi.name.toLowerCase().replace(/\s+/g, '')
  return columns.some(col => {
    const colLower = col.toLowerCase().replace(/\s+/g, '')
    return colLower.includes(kpiLower) || kpiLower.includes(colLower)
  })
}

export function calculateKPICoverage(requestedKPIs: KPI[], availableColumns: string[]): KPICoverage {
  const covered: KPI[] = []
  const missing: KPI[] = []
  for (const kpi of requestedKPIs) {
    if (isKPICovered(kpi, availableColumns)) covered.push(kpi)
    else missing.push(kpi)
  }
  const percentage = requestedKPIs.length === 0
    ? 0
    : Math.round((covered.length / requestedKPIs.length) * 100)
  return { requested: requestedKPIs, covered, missing, percentage }
}

export function parseKPINames(names: string[]): KPI[] {
  return names.map((name, i) => ({
    id: `kpi-${i}`,
    name: name.trim(),
    description: '',
    unit: '',
  }))
}