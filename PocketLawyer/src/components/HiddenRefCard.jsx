import { useState } from 'react'

const IMPORTANCE = {
  high:   { color: '#e05252', label: 'HIGH IMPORTANCE — review carefully' },
  medium: { color: '#e6a817', label: 'MEDIUM IMPORTANCE — worth noting' },
  low:    { color: '#4caf7d', label: 'LOW IMPORTANCE — for awareness' },
}

const TYPE_MAP = [
  { re: /\bart\.?\b|article/i,               icon: '⚖',  type: 'Article' },
  { re: /\bsection\b|\bsec\.?\b/i,           icon: '§',   type: 'Section' },
  { re: /\bschedule\b|\bsch\.?\b/i,          icon: '📋',  type: 'Schedule' },
  { re: /\bclause\b|\bcl\.?\b/i,             icon: '¶',   type: 'Clause' },
  { re: /exhibit|annexure|appendix|annex/i,  icon: '📎',  type: 'Annexure' },
  { re: /\brule\b|\bregulation\b|\breg\.?\b/i, icon: '⚖', type: 'Regulation' },
  { re: /\bact\b/i,                          icon: '⚖',  type: 'Act' },
]

function detectType(ref) {
  for (const { re, icon, type } of TYPE_MAP) {
    if (re.test(ref)) return { icon, type }
  }
  return { icon: '#', type: 'Reference' }
}

function detectImportance(ref, explanation = '') {
  const text = `${ref} ${explanation}`.toLowerCase()
  if (/criminal|penal|imprisonment|forfeit|illegal|prohibited|arrest|offence|compulsory/.test(text)) return 'high'
  if (/liable|liability|damages|compensation|breach|termination|penalty|fine|dispute|arbitrat/.test(text)) return 'medium'
  return 'low'
}

export default function HiddenRefCard({ reference, index }) {
  const [open, setOpen] = useState(false)
  const { icon, type } = detectType(reference.ref)
  const importance     = detectImportance(reference.ref, reference.explanation)
  const imp            = IMPORTANCE[importance]

  return (
    <div
      className="clause-enter"
      style={{ animationDelay: `${index * 50}ms`, background: '#fff', borderRadius: '10px', border: '1px solid #e4ddd0', overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem' }}>
        {/* Importance dot */}
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: imp.color, flexShrink: 0 }} />

        {/* Type icon */}
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', color: '#6b6b80', flexShrink: 0, width: '1.2rem', textAlign: 'center' }}>
          {icon}
        </span>

        {/* Ref name */}
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.92rem', color: '#1a1a2e', fontWeight: 700, flex: 1, minWidth: 0 }}>
          {reference.ref}
        </span>

        {/* Type badge */}
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: '#a0a0b8', border: '1px solid #e4ddd0', borderRadius: '4px', padding: '2px 7px', flexShrink: 0, letterSpacing: '0.07em' }}>
          {type.toUpperCase()}
        </span>

        <span style={{ color: '#a0a0b8', fontSize: '0.75rem', flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
          ▾
        </span>
      </div>

      {/* ── Collapsed preview ── */}
      {!open && reference.explanation && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: '#6b6b80', lineHeight: 1.6, padding: '0 1.25rem 0.9rem', marginTop: '-0.2rem' }}>
          {reference.explanation.length > 130
            ? reference.explanation.slice(0, 130) + '…'
            : reference.explanation}
        </p>
      )}

      {/* ── Expanded body ── */}
      {open && (
        <div
          style={{ borderTop: '1px solid #f0ebe3', padding: '1.1rem 1.25rem 1.25rem' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Plain English box */}
          {reference.explanation && (
            <div style={{ background: '#fdf8f0', borderRadius: '8px', padding: '0.875rem', marginBottom: '1rem' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: '#a0a0b8', letterSpacing: '0.13em', marginBottom: '0.4rem' }}>
                ¶ PLAIN ENGLISH MEANING
              </p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: '#3a3a4a', lineHeight: 1.65 }}>
                {reference.explanation}
              </p>
            </div>
          )}

          {/* Importance row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: imp.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: imp.color, letterSpacing: '0.08em' }}>
              {imp.label}
            </span>
          </div>

          {/* Deep search */}
          <button
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.1em', color: '#c9a84c', background: '#1a1a2e', border: 'none', borderRadius: '6px', padding: '0.45rem 1rem', cursor: 'pointer' }}
          >
            🔍 DEEP SEARCH
          </button>
        </div>
      )}
    </div>
  )
}
