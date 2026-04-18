import { useState } from 'react'
import UploadZone from './components/UploadZone.jsx'
import ClauseCard from './components/ClauseCard.jsx'
import HiddenRefCard from './components/HiddenRefCard.jsx'
import SearchPanel from './components/SearchPanel.jsx'
import Chatbot from './components/Chatbot.jsx'
import { analyzeContract } from './utils/analyzeContract.js'

/* ── Error message helper ──────────────────────────── */
function friendlyError(err) {
  const msg = err?.message ?? String(err)
  if (/fetch|network|failed to fetch/i.test(msg)) return 'Connection error — check your internet and try again.'
  if (/401|api.?key|authentication/i.test(msg)) return 'API key error — check your ANTHROPIC_API_KEY.'
  if (/429|rate.?limit/i.test(msg)) return 'Too many requests — please wait a moment and try again.'
  if (/413|too.?large/i.test(msg)) return 'File too large — try uploading fewer or smaller pages.'
  if (/500|server/i.test(msg)) return 'Server error — please try again in a moment.'
  if (/json|parse/i.test(msg)) return 'Unexpected response — the model returned an unreadable format. Try again.'
  return msg || 'Something went wrong. Please try again.'
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner">
      <span className="error-banner-icon">⚠</span>
      <div>
        <p className="error-banner-title">ANALYSIS ERROR</p>
        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: '#8a3a3a', lineHeight: 1.5 }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.1em', color: '#e05252', background: 'transparent', border: '1px solid #e05252', borderRadius: '4px', padding: '3px 10px', marginTop: '0.5rem', cursor: 'pointer' }}
          >
            RETRY
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Design tokens ─────────────────────────────────── */
const RISK = {
  high:   { color: '#e05252', label: 'High Risk' },
  medium: { color: '#e6a817', label: 'Medium Risk' },
  low:    { color: '#4caf7d', label: 'Low Risk' },
  info:   { color: '#4a90d9', label: 'Key Clause' },
}
const RISK_ORDER = { info: 0, low: 1, medium: 2, high: 3 }

const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'high',   label: 'High Risk' },
  { key: 'medium', label: 'Medium Risk' },
  { key: 'low',    label: 'Low Risk' },
  { key: 'info',   label: 'Key Clause' },
]

/* ── Static styles ─────────────────────────────────── */
const s = {
  page: { minHeight: '100vh', background: '#f5f1ea', display: 'flex', flexDirection: 'column' },

  header: {
    background: '#1a1a2e',
    padding: '0 2rem',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '3px solid #c9a84c',
    flexShrink: 0,
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  brandName: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.5rem', color: '#c9a84c', letterSpacing: '0.02em', lineHeight: 1 },
  subtitle:  { fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: '#a0a0b8', letterSpacing: '0.18em' },
  headerBadge: { fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#c9a84c', border: '1px solid #c9a84c', borderRadius: '4px', padding: '4px 10px', letterSpacing: '0.1em' },

  uploadPanel: { padding: '2rem 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' },

  analyzeBtn: (disabled) => ({
    width: '100%',
    padding: '0.9rem 2rem',
    background: disabled ? '#e4ddd0' : 'linear-gradient(135deg, #1a1510, #2d2418)',
    color: disabled ? '#a0a0b8' : '#c9a84c',
    border: 'none',
    borderRadius: '8px',
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  }),
  progressText: { fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.06em', textAlign: 'center', minHeight: '1rem' },

  resultsSection: { flex: 1, display: 'flex', padding: '2rem', gap: '1.5rem', alignItems: 'flex-start' },

  sidebar: { width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' },
  sidebarCard: { background: '#fff', borderRadius: '10px', border: '1px solid #e4ddd0', padding: '1.25rem' },
  cardLabel: { fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.14em', color: '#a0a0b8', textTransform: 'uppercase', marginBottom: '0.85rem' },

  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '4rem 2rem', background: '#fff', borderRadius: '10px', border: '1px dashed #e4ddd0' },
  emptyIcon: { fontSize: '2.5rem', opacity: 0.25 },
  emptyText: { fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#a0a0b8' },
}

/* ── Sidebar: Risk Meter ───────────────────────────── */
function RiskMeter({ results }) {
  if (!results) {
    return (
      <div style={s.sidebarCard}>
        <p style={s.cardLabel}>Overall Risk</p>
        <div style={{ height: '10px', background: '#f0ebe3', borderRadius: '99px', marginBottom: '1rem' }} />
        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: '#a0a0b8', textAlign: 'center' }}>
          Upload a contract to see the risk overview
        </p>
      </div>
    )
  }

  const { clauses = [], overallRisk, riskSummary, title } = results
  const total = clauses.length || 1
  const counts = { high: 0, medium: 0, low: 0, info: 0 }
  for (const c of clauses) if (c.risk in counts) counts[c.risk]++

  const overallMeta = RISK[overallRisk] ?? RISK.low

  return (
    <div style={s.sidebarCard}>
      {title && (
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.6rem', lineHeight: 1.4 }}>
          {title}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <p style={{ ...s.cardLabel, marginBottom: 0 }}>Overall Risk</p>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: overallMeta.color, border: `1px solid ${overallMeta.color}`, borderRadius: '4px', padding: '1px 7px' }}>
          {overallMeta.label.toUpperCase()}
        </span>
      </div>

      {/* Stacked distribution bar */}
      <div style={{ display: 'flex', height: '10px', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.75rem', background: '#f0ebe3' }}>
        {['high', 'medium', 'low', 'info'].map(r => {
          const pct = (counts[r] / total) * 100
          return pct > 0 ? (
            <div key={r} style={{ width: `${pct}%`, background: RISK[r].color, transition: 'width 0.6s ease' }} title={`${RISK[r].label}: ${counts[r]}`} />
          ) : null
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
        {['high', 'medium', 'low', 'info'].map(r => counts[r] > 0 && (
          <span key={r} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: RISK[r].color, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: RISK[r].color, display: 'inline-block' }} />
            {counts[r]}
          </span>
        ))}
      </div>

      {riskSummary && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: '0.78rem', color: '#6b6b80', lineHeight: 1.6 }}>
          {riskSummary}
        </p>
      )}
    </div>
  )
}

/* ── Sidebar: Clause Breakdown ─────────────────────── */
function ClauseBreakdown({ results, activeFilter, onFilter }) {
  const counts = { high: 0, medium: 0, low: 0, info: 0 }
  if (results) {
    for (const c of results.clauses ?? []) if (c.risk in counts) counts[c.risk]++
  }

  return (
    <div style={s.sidebarCard}>
      <p style={s.cardLabel}>Clause Breakdown</p>
      {['high', 'medium', 'low', 'info'].map(r => {
        const active = activeFilter === r
        return (
          <button
            key={r}
            onClick={() => onFilter(active ? 'all' : r)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.45rem 0.6rem',
              marginBottom: '0.25rem',
              borderRadius: '6px',
              border: 'none',
              background: active ? `${RISK[r].color}18` : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <span style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: active ? RISK[r].color : '#3a3a4a' }}>
              {RISK[r].label}
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.68rem',
              minWidth: '24px',
              textAlign: 'center',
              color: RISK[r].color,
              border: `1px solid ${RISK[r].color}`,
              borderRadius: '4px',
              padding: '1px 6px',
            }}>
              {results ? counts[r] : '—'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Main: View tabs (Clauses | References | Search) ── */
function ViewTabs({ active, onChange, clauseCount, refCount }) {
  const tabs = [
    { key: 'clauses',    label: 'Clauses',    count: clauseCount },
    { key: 'references', label: 'References', count: refCount },
    { key: 'search',     label: 'Search',     count: 0 },
  ]
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid #e4ddd0', marginBottom: '1rem' }}>
      {tabs.map(({ key, label, count }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              padding: '0.6rem 1.1rem',
              border: 'none',
              borderBottom: isActive ? '2px solid #c9a84c' : '2px solid transparent',
              marginBottom: '-2px',
              background: 'transparent',
              color: isActive ? '#c9a84c' : '#a0a0b8',
              cursor: 'pointer',
              transition: 'color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {label.toUpperCase()}
            {count > 0 && (
              <span style={{ background: isActive ? '#c9a84c22' : '#f0ebe3', color: isActive ? '#c9a84c' : '#a0a0b8', borderRadius: '99px', padding: '0 6px', fontSize: '0.6rem' }}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Main: Filter tabs ─────────────────────────────── */
function FilterTabs({ active, onChange, counts }) {
  return (
    <div className="filter-tabs-row">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key
        const color = key === 'all' ? '#1a1a2e' : RISK[key]?.color ?? '#1a1a2e'
        const count = key === 'all' ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[key] ?? 0
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              padding: '0.35rem 0.8rem',
              borderRadius: '99px',
              border: `1px solid ${isActive ? color : '#e4ddd0'}`,
              background: isActive ? color : '#fff',
              color: isActive ? '#fff' : '#6b6b80',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {label.toUpperCase()}
            {count > 0 && (
              <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#f0ebe3', borderRadius: '99px', padding: '0 5px', fontSize: '0.58rem', color: isActive ? '#fff' : '#6b6b80' }}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Root ──────────────────────────────────────────── */
export default function App() {
  const [files, setFiles]     = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError]     = useState(null)
  const [filter, setFilter]     = useState('all')
  const [view, setView]         = useState('clauses')
  const [chatOpen, setChatOpen] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState(null)

  function askAssistant(msg) {
    setTriggerMsg(msg)
    setChatOpen(true)
  }

  const disabled = files.length === 0 || loading

  async function handleAnalyze() {
    if (disabled) return
    setLoading(true)
    setError(null)
    setResults(null)
    setFilter('all')
    setView('clauses')
    setProgress(files.length > 5 ? 'Preparing analysis…' : '')
    try {
      const data = await analyzeContract(files, setProgress)
      setResults(data)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const buttonLabel = loading ? (progress || 'Analyzing Contract…') : 'Analyze Contract'

  /* Derive filtered clause list + counts */
  const allClauses = results?.clauses ?? []
  const allRefs    = results?.hiddenReferences ?? []
  const counts = { high: 0, medium: 0, low: 0, info: 0 }
  for (const c of allClauses) if (c.risk in counts) counts[c.risk]++
  const visible = filter === 'all' ? allClauses : allClauses.filter(c => c.risk === filter)

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logoGroup}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>⚖️</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={s.brandName}>PocketLawyer</span>
            <span style={s.subtitle} className="header-subtitle">CONTRACT RISK ANALYZER</span>
          </div>
        </div>
        <span style={s.headerBadge} className="header-badge">AI POWERED</span>
      </header>

      {/* Upload + Analyze */}
      <div className="upload-panel">
        <UploadZone files={files} onFilesChange={setFiles} />
        <button style={s.analyzeBtn(disabled)} disabled={disabled} onClick={handleAnalyze}>
          {loading && <span className="spinner" />}
          {buttonLabel}
        </button>
        {error && <ErrorBanner message={error} onRetry={files.length > 0 ? handleAnalyze : null} />}
        {!error && progress && (
          <p className="pulsing" style={s.progressText}>{progress}</p>
        )}
      </div>

      {/* Two-column results */}
      <div className="results-section">
        {/* 300 px sidebar */}
        <aside className="sidebar">
          <RiskMeter results={results} />
          <ClauseBreakdown results={results} activeFilter={filter} onFilter={setFilter} />
        </aside>

        {/* Main content */}
        <main className="main-content">
          {/* View tabs — only show when results are available */}
          {(allClauses.length > 0 || allRefs.length > 0) && (
            <ViewTabs
              active={view}
              onChange={v => { setView(v); setFilter('all') }}
              clauseCount={allClauses.length}
              refCount={allRefs.length}
            />
          )}

          {/* ── Clauses view ── */}
          {view === 'clauses' && (
            <>
              {allClauses.length > 0 && (
                <FilterTabs active={filter} onChange={setFilter} counts={counts} />
              )}
              {visible.length > 0 ? (
                visible.map((c, i) => <ClauseCard key={c.id} clause={c} index={i} onAskAssistant={askAssistant} />)
              ) : (
                <div style={s.emptyState}>
                  <span style={s.emptyIcon}>⚖️</span>
                  <span style={s.emptyText}>
                    {loading
                      ? 'Analysing your contract…'
                      : filter !== 'all'
                      ? `No ${RISK[filter]?.label ?? filter} clauses found`
                      : 'Upload a contract to see the full analysis'}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── References view ── */}
          {view === 'references' && (
            <>
              {allRefs.length > 0 ? (
                allRefs.map((ref, i) => (
                  <HiddenRefCard key={i} reference={ref} index={i} />
                ))
              ) : (
                <div style={s.emptyState}>
                  <span style={s.emptyIcon}>§</span>
                  <span style={s.emptyText}>
                    {loading ? 'Detecting references…' : 'No hidden references detected'}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── Search view ── */}
          {view === 'search' && (
            <SearchPanel files={files} hiddenRefs={allRefs} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="legal-footer">
        <p>⚖ FOR INFORMATIONAL PURPOSES ONLY — NOT LEGAL ADVICE</p>
        <p>PocketLawyer uses AI to assist with contract review. Always consult a qualified lawyer before signing.</p>
      </footer>

      <Chatbot
        results={results}
        open={chatOpen}
        onToggle={setChatOpen}
        triggerMessage={triggerMsg}
        onTriggerHandled={() => setTriggerMsg(null)}
      />
    </div>
  )
}
