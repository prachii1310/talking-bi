import { NextRequest, NextResponse } from 'next/server'
import { getDb }                     from '@/lib/mongodb'

// Parse a CSV string into array of objects
function parseCSV(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const lines   = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row')

  // Parse headers — clean special chars
  const rawHeaders = parseCSVLine(lines[0])
  const headers    = rawHeaders.map(h =>
    h.replace(/[^a-zA-Z0-9_]/g, '_')
     .replace(/_+/g, '_')
     .replace(/^_|_$/g, '')
     .toLowerCase() || 'column'
  )

  const rows: Record<string, unknown>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue
    const doc: Record<string, unknown> = {}
    headers.forEach((h, idx) => {
      doc[h] = inferValue(values[idx] ?? '')
    })
    rows.push(doc)
  }

  return { headers, rows }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current  = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function inferValue(val: string): string | number | boolean | null {
  if (val === '' || val === null) return null
  const stripped = val.replace(/[$,₹%\s"]/g, '')
  const num      = parseFloat(stripped)
  if (!isNaN(num) && stripped !== '') return num
  if (val.toLowerCase() === 'true')  return true
  if (val.toLowerCase() === 'false') return false
  return val
}

export async function POST(req: NextRequest) {
  try {
    const formData   = await req.formData()
    const file       = formData.get('file') as File | null
    const collection = (formData.get('collection') as string) || 'uploaded_data'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()

    // Parse CSV
    const { headers, rows } = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 })
    }

    // Get numeric columns — these are usable as KPIs
    const numericColumns = headers.filter(h => {
      const samples = rows.slice(0, 20).map(r => r[h])
      return samples.some(v => typeof v === 'number')
    })

    const textColumns = headers.filter(h => !numericColumns.includes(h))

    // Save to MongoDB
    const db   = await getDb()
    const col  = db.collection(collection)

    // Clear existing data in this collection
    await col.deleteMany({})

    // Insert in batches
    const BATCH = 500
    for (let i = 0; i < rows.length; i += BATCH) {
      await col.insertMany(rows.slice(i, i + BATCH))
    }

    return NextResponse.json({
      success:        true,
      collection,
      totalRows:      rows.length,
      headers,
      numericColumns,
      textColumns,
      preview:        rows.slice(0, 3), // first 3 rows as preview
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[upload] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}