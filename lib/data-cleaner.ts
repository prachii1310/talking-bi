export interface RawRow  { [key: string]: unknown }
export interface CleanRow { [key: string]: string | number | null }

export function removeEmptyRows(rows: RawRow[]): RawRow[] {
  return rows.filter(row =>
    Object.values(row).some(v => v !== null && v !== undefined && v !== '')
  )
}

export function normaliseNumbers(rows: RawRow[]): CleanRow[] {
  return rows.map(row => {
    const clean: CleanRow = {}
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === 'string') {
        const stripped = val.replace(/[,₹$%\s]/g, '')
        const asNum = parseFloat(stripped)
        clean[key] = isNaN(asNum) ? val : asNum
      } else if (typeof val === 'number') {
        clean[key] = val
      } else if (val === null || val === undefined) {
        clean[key] = null
      } else {
        clean[key] = String(val)
      }
    }
    return clean
  })
}

export function inferSchema(rows: CleanRow[]): Record<string, 'number' | 'string' | 'mixed'> {
  if (rows.length === 0) return {}
  const schema: Record<string, 'number' | 'string' | 'mixed'> = {}
  for (const key of Object.keys(rows[0])) {
    const types = rows.map(r => typeof r[key]).filter(t => t !== 'object')
    const unique = [...new Set(types)]
    schema[key] = unique.length === 1 ? unique[0] as 'number' | 'string' : 'mixed'
  }
  return schema
}

export function cleanData(rawRows: RawRow[]) {
  const rows = normaliseNumbers(removeEmptyRows(rawRows))
  return { rows, schema: inferSchema(rows), count: rows.length }
}