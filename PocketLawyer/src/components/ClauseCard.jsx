import { useState } from 'react'

const RISK_META = {
  high:   { color: '#e05252', label: 'High Risk',   bg: '#fff5f5' },
  medium: { color: '#e6a817', label: 'Medium Risk',  bg: '#fffbf0' },
  low:    { color: '#4caf7d', label: 'Low Risk',     bg: '#f0faf5' },
  info:   { color: '#4a90d9', label: 'Key Clause',   bg: '#f0f6ff' },
}

export default function ClauseCard({ clause, index }) {
  const [open, setOpen] = useState(false)
  const meta = RISK_META[clause.risk] ?? RISK_META.info
  const num = String(clause.id).padStart(2, '0')

  return (
    <div
      className="clause-enter"
      style={{ animationDelay: `${index * 55}ms`, borderRadius: '10px', overflow: 'hidden', border: '1px solid #e4ddd0', borderLeft: `4px solid ${meta.color}`, background: '#fff', cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}
    >
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: meta.color, letterSpacing: '0.05em', flexShrink: 0 }}>
          §{num}
        </span>

        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', color: '#1a1a2e', fontWeight: 700, flex: 1, minWidth: 0 }}>
          {clause.title}
        </span>

        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: meta.color, border: `1px solid ${meta.color}`, borderRadius: '4px', padding: '2px 8px', flexShrink: 0, letterSpacing: '0.06em' }}>
          {meta.label.toUpperCase()}
        </span>

        <span style={{ color: '#a0a0b8', fontSize: '0.75rem', flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
          ▾
        </span>
      </div>

      {/* ── Collapsed preview ── */}
      {!open && clause.plainEnglish && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: '#6b6b80', lineHeight: 1.6, padding: '0 1.25rem 0.9rem', marginTop: '-0.2rem' }}>
          {clause.plainEnglish}
        </p>
      )}

      {/* ── Expanded body ── */}
      {open && (
        <div
          style={{ borderTop: '1px solid #f0ebe3', padding: '1.1rem 1.25rem 1.25rem' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Original language quote */}
          {clause.originalText && (
            <blockquote style={{
              fontFamily: "'Lora', serif",
              fontSize: '0.8rem',
              fontStyle: 'italic',
              color: '#5a5a70',
              lineHeight: 1.75,
              borderLeft: `3px solid ${meta.color}`,
              background: meta.bg,
              padding: '0.75rem 1rem',
              borderRadius: '0 6px 6px 0',
              margin: '0 0 1.1rem',
            }}>
              "{clause.originalText}"
            </blockquote>
          )}

          {/* Why It Matters + What To Do */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <InfoBox label="WHY IT MATTERS" bg="#fdf8f0" icon="⚠">
              {clause.riskReason}
            </InfoBox>
            <InfoBox label="WHAT TO DO" bg="#f0faf5" icon="✓">
              {clause.recommendation}
            </InfoBox>
          </div>

          {/* Related refs */}
          {clause.relatedRefs?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              {clause.relatedRefs.map((ref, i) => (
                <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: '#6b6b80', border: '1px solid #e4ddd0', borderRadius: '4px', padding: '2px 8px' }}>
                  ↗ {ref}
                </span>
              ))}
            </div>
          )}

          {/* Ask assistant */}
          <button
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              color: '#c9a84c',
              background: '#1a1a2e',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 1rem',
              cursor: 'pointer',
            }}
          >
            ⚖ ASK ASSISTANT
          </button>
        </div>
      )}
    </div>
  )
}

function InfoBox({ label, bg, icon, children }) {
  return (
    <div style={{ background: bg, borderRadius: '8px', padding: '0.8rem' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: '#a0a0b8', letterSpacing: '0.13em', marginBottom: '0.4rem' }}>
        {icon} {label}
      </p>
      <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#3a3a4a', lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  )
}
