import { useState, useRef } from 'react'
import { searchContract } from '../utils/searchContract.js'

/* ── Helpers ─────────────────────────────────────────── */
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ found }) {
  const color = found ? '#4caf7d' : '#e05252'
  const label = found ? '✓ FOUND' : '✗ NOT FOUND'
  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', color, border: `1px solid ${color}`, borderRadius: '4px', padding: '3px 10px' }}>
      {label}
    </span>
  )
}

function ResultSection({ icon, label, bg, accent, children }) {
  if (!children) return null
  return (
    <div style={{ background: bg, borderRadius: '8px', padding: '0.875rem', marginBottom: '0.7rem' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: accent, letterSpacing: '0.13em', marginBottom: '0.45rem' }}>
        {icon} {label}
      </p>
      <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: '#3a3a4a', lineHeight: 1.65, margin: 0 }}>
        {children}
      </p>
    </div>
  )
}

function QuoteBlock({ quotes }) {
  if (!quotes?.length) return null
  return (
    <div style={{ marginBottom: '0.7rem' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: '#a0a0b8', letterSpacing: '0.13em', marginBottom: '0.45rem' }}>
        " EXACT QUOTES FROM DOCUMENT
      </p>
      {quotes.map((q, i) => (
        <blockquote key={i} style={{
          fontFamily: "'Lora', serif",
          fontSize: '0.8rem',
          fontStyle: 'italic',
          color: '#d4c9b0',
          background: '#1a1a2e',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          margin: i < quotes.length - 1 ? '0 0 0.5rem' : 0,
          lineHeight: 1.75,
          borderLeft: '3px solid #c9a84c',
        }}>
          "{q}"
        </blockquote>
      ))}
    </div>
  )
}

/* ── Main component ───────────────────────────────────── */
export default function SearchPanel({ files, hiddenRefs }) {
  const [query, setQuery]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [activeResult, setActive]   = useState(null)
  const [history, setHistory]       = useState([])
  const inputRef = useRef(null)

  const canSearch = files.length > 0 && query.trim().length > 0 && !loading

  async function runSearch(q) {
    const trimmed = (q ?? query).trim()
    if (!trimmed || !files.length || loading) return
    setQuery(trimmed)
    setLoading(true)
    setError(null)
    setActive(null)
    try {
      const result = await searchContract(files, trimmed)
      const entry = { id: Date.now(), query: trimmed, result }
      setHistory(h => [entry, ...h.filter(e => e.query.toLowerCase() !== trimmed.toLowerCase())])
      setActive(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') runSearch()
  }

  function handleHistoryClick(entry) {
    setQuery(entry.query)
    setActive(entry.result)
    setError(null)
  }

  function handleChip(ref) {
    setQuery(ref)
    runSearch(ref)
  }

  /* ── No files state ── */
  if (!files.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '10px', border: '1px dashed #e4ddd0', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem', opacity: 0.2 }}>🔍</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#a0a0b8' }}>Upload and analyse a contract first</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Search box ── */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e4ddd0', padding: '1.25rem' }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.14em', color: '#a0a0b8', marginBottom: '0.75rem' }}>
          SEARCH CONTRACT
        </p>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search for a term, clause, section, or legal reference…"
            style={{
              flex: 1,
              fontFamily: "'Lora', serif",
              fontSize: '0.9rem',
              color: '#1a1a2e',
              background: '#fdf8f0',
              border: '1px solid #e4ddd0',
              borderRadius: '6px',
              padding: '0.6rem 0.9rem',
              outline: 'none',
            }}
          />
          <button
            onClick={() => runSearch()}
            disabled={!canSearch}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: canSearch ? '#c9a84c' : '#a0a0b8',
              background: canSearch ? 'linear-gradient(135deg, #1a1510, #2d2418)' : '#e4ddd0',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1.2rem',
              cursor: canSearch ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexShrink: 0,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? <span className="spinner" /> : '🔍'} SEARCH
          </button>
        </div>

        {/* Quick-click chips from detected references */}
        {hiddenRefs?.length > 0 && (
          <div style={{ marginTop: '0.9rem' }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.12em', color: '#c0b89a', marginBottom: '0.5rem' }}>
              QUICK SEARCH — DETECTED REFERENCES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {hiddenRefs.slice(0, 12).map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleChip(r.ref)}
                  disabled={loading}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem',
                    letterSpacing: '0.05em',
                    color: '#1a1a2e',
                    background: '#f5f1ea',
                    border: '1px solid #d4c9b0',
                    borderRadius: '99px',
                    padding: '3px 10px',
                    cursor: loading ? 'default' : 'pointer',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading) { e.target.style.background = '#ede8df'; e.target.style.borderColor = '#c9a84c' } }}
                  onMouseLeave={e => { e.target.style.background = '#f5f1ea'; e.target.style.borderColor = '#d4c9b0' }}
                >
                  {r.ref.length > 30 ? r.ref.slice(0, 30) + '…' : r.ref}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Search history ── */}
      {history.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e4ddd0', padding: '1rem 1.25rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.14em', color: '#a0a0b8', marginBottom: '0.65rem' }}>
            SEARCH HISTORY
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {history.map(entry => {
              const isActive = activeResult?.query === entry.query
              return (
                <button
                  key={entry.id}
                  onClick={() => handleHistoryClick(entry)}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: isActive ? '#c9a84c' : '#6b6b80',
                    background: isActive ? '#1a1a2e' : '#f5f1ea',
                    border: `1px solid ${isActive ? '#c9a84c' : '#e4ddd0'}`,
                    borderRadius: '99px',
                    padding: '3px 10px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: entry.result.found ? '#4caf7d' : '#e05252', flexShrink: 0 }} />
                  {entry.query.length > 28 ? entry.query.slice(0, 28) + '…' : entry.query}
                  <span style={{ opacity: 0.5, fontSize: '0.55rem' }}>{formatTime(entry.id)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #e05252', borderRadius: '10px', padding: '1rem 1.25rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#e05252' }}>⚠ {error}</p>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e4ddd0', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[100, 70, 85, 60].map((w, i) => (
            <div key={i} style={{ height: '12px', borderRadius: '6px', background: 'linear-gradient(90deg, #f0ebe3 25%, #e8e2d8 50%, #f0ebe3 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* ── Result ── */}
      {activeResult && !loading && (
        <div className="clause-enter" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e4ddd0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Result header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#1a1a2e', fontWeight: 700 }}>
              "{activeResult.query}"
            </span>
            <StatusBadge found={activeResult.found} />
          </div>

          <QuoteBlock quotes={activeResult.quotes} />

          <ResultSection icon="¶" label="PLAIN ENGLISH" bg="#fdf8f0" accent="#c0b89a">
            {activeResult.plainEnglish}
          </ResultSection>

          {activeResult.legalContext && (
            <ResultSection icon="⚖" label="LEGAL CONTEXT" bg="#f0f6ff" accent="#4a90d9">
              {activeResult.legalContext}
            </ResultSection>
          )}

          <ResultSection icon="!" label="IMPLICATIONS" bg="#fffbf0" accent="#e6a817">
            {activeResult.implications}
          </ResultSection>

          <ResultSection icon="✓" label="RECOMMENDATION" bg="#f0faf5" accent="#4caf7d">
            {activeResult.recommendation}
          </ResultSection>
        </div>
      )}
    </div>
  )
}
