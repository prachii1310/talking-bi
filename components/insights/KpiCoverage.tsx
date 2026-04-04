import type { KPICoverage } from '@/types/kpi'

export default function KpiCoverage({ coverage }: { coverage: KPICoverage }) {
  const pct   = coverage.percentage
  const color = pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{
      background:   'var(--bg-card)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding:      '1.25rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>KPI Coverage</h3>
        <span style={{
          fontSize:   '1.5rem',
          fontWeight: 700,
          color,
        }}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height:       8,
        background:   'var(--border)',
        borderRadius: 99,
        overflow:     'hidden',
        marginBottom: 14,
      }}>
        <div style={{
          height:     '100%',
          width:      `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 1s ease',
        }} />
      </div>

      {/* Covered KPIs */}
      {coverage.covered.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>
            ✅ Found in data
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {coverage.covered.map(k => (
              <span key={k.id} style={{
                padding:      '3px 10px',
                borderRadius: 99,
                background:   'rgba(34,197,94,0.1)',
                border:       '1px solid rgba(34,197,94,0.3)',
                color:        'var(--success)',
                fontSize:     '0.78rem',
                fontWeight:   500,
              }}>
                {k.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing KPIs */}
      {coverage.missing.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>
            ❌ Not found in data
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {coverage.missing.map(k => (
              <span key={k.id} style={{
                padding:      '3px 10px',
                borderRadius: 99,
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.3)',
                color:        'var(--danger)',
                fontSize:     '0.78rem',
                fontWeight:   500,
              }}>
                {k.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary line */}
      <p style={{
        fontSize:   '0.75rem',
        color:      'var(--text-dim)',
        marginTop:  12,
        paddingTop: 10,
        borderTop:  '1px solid var(--border)',
      }}>
        {coverage.covered.length} of {coverage.requested.length} KPIs tracked in this dashboard
      </p>
    </div>
  )
}