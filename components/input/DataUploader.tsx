'use client'
import { useState, useRef, useCallback } from 'react'

interface UploadResult {
  collection:     string
  totalRows:      number
  headers:        string[]
  numericColumns: string[]
  textColumns:    string[]
  preview:        Record<string, unknown>[]
}

interface Props {
  onUploadComplete: (result: UploadResult) => void
}

export default function DataUploader({ onUploadComplete }: Props) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result,    setResult]    = useState<UploadResult | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const [fileName,  setFileName]  = useState<string | null>(null)
  const [progress,  setProgress]  = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.')
      return
    }

    setError(null)
    setUploading(true)
    setFileName(file.name)
    setProgress(0)

    // Animate progress
    const interval = setInterval(() => {
      setProgress(p => p < 85 ? p + Math.random() * 15 : p)
    }, 300)

    const collection = file.name
      .replace('.csv', '')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase()

    const formData = new FormData()
    formData.append('file',       file)
    formData.append('collection', collection)

    try {
      const res  = await fetch('/api/data/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Upload failed')
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setResult(json)
        onUploadComplete(json)
      }, 400)
    } catch (err: any) {
      clearInterval(interval)
      setError(err.message || 'Upload failed')
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [])

  // ── Success state ─────────────────────────────────────────────────
  if (result) {
    return (
      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Success banner */}
        <div style={{
          background:   'rgba(16,185,129,0.08)',
          border:       '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding:      '1.25rem',
          display:      'flex',
          alignItems:   'center',
          gap:          14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', flexShrink: 0,
          }}>✅</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>
              {fileName}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {result.totalRows.toLocaleString()} rows · {result.headers.length} columns · saved to MongoDB
            </p>
          </div>
          <span className="badge badge-success">Ready</span>
        </div>

        {/* Numeric columns */}
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <p className="label-text" style={{ marginBottom: 10 }}>
            📊 Numeric columns — use these as KPIs
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.numericColumns.map(col => (
              <span key={col} className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Text columns */}
        {result.textColumns.length > 0 && (
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <p className="label-text" style={{ marginBottom: 10 }}>
              🔤 Text columns — used for grouping charts
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.textColumns.slice(0, 10).map(col => (
                <span key={col} style={{
                  padding: '3px 10px', borderRadius: 99,
                  background: 'var(--bg-hover)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: '0.75rem',
                }}>
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preview table */}
        <div className="card" style={{ padding: '1rem 1.25rem', overflowX: 'auto' }}>
          <p className="label-text" style={{ marginBottom: 10 }}>👁 Data preview</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                {result.headers.slice(0, 7).map(h => (
                  <th key={h} style={{
                    padding: '6px 12px', textAlign: 'left',
                    color: 'var(--text-muted)', fontWeight: 500,
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.preview.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {result.headers.slice(0, 7).map(h => (
                    <td key={h} style={{
                      padding: '6px 12px', color: 'var(--text-muted)',
                      whiteSpace: 'nowrap', maxWidth: 120,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: '0.82rem' }}
          onClick={() => { setResult(null); setFileName(null); setError(null) }}>
          ↺ Upload different file
        </button>
      </div>
    )
  }

  // ── Upload zone ───────────────────────────────────────────────────
  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border:        `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-light)'}`,
          borderRadius:  'var(--radius-xl)',
          padding:       '3rem 2rem',
          textAlign:     'center',
          cursor:        uploading ? 'default' : 'pointer',
          background:    dragging ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
          transition:    'all 0.25s',
          boxShadow:     dragging ? '0 0 40px rgba(99,102,241,0.15)' : 'none',
        }}
      >
        <input ref={fileInputRef} type="file" accept=".csv"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
          style={{ display: 'none' }} />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '2.5rem' }} className="animate-float">⚙️</div>
            <p style={{ fontWeight: 600, color: 'var(--text)' }}>
              Processing {fileName}…
            </p>
            {/* Progress bar */}
            <div style={{ width: 240, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Parsing CSV → Saving to MongoDB…
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', marginBottom: 4,
              transition: 'all 0.2s',
              transform: dragging ? 'scale(1.1)' : 'scale(1)',
            }}>
              {dragging ? '📥' : '📂'}
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              {dragging ? 'Drop it here!' : 'Drop your CSV file'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse files</span>
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              Any CSV up to 10MB — sales, finance, HR, anything
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              {['Superstore.csv', 'sales_data.csv', 'orders.csv', 'any_data.csv'].map(ex => (
                <span key={ex} style={{
                  padding: '3px 10px', borderRadius: 99,
                  border: '1px solid var(--border)',
                  fontSize: '0.72rem', color: 'var(--text-dim)',
                }}>{ex}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: 12, padding: '0.75rem 1rem',
          borderRadius: 'var(--radius)',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--danger)', fontSize: '0.85rem',
        }}>
          ⚠ {error}
        </div>
      )}
    </div>
  )
}