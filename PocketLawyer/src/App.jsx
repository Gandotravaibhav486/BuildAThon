import { useState } from 'react'
import UploadZone from './components/UploadZone.jsx'
import { analyzeContract } from './utils/analyzeContract.js'

const RISK_COLORS = { high: '#e05252', medium: '#e6a817', low: '#4caf7d' }

const s = {
  page: {
    minHeight: '100vh',
    background: '#f5f1ea',
    display: 'flex',
    flexDirection: 'column',
  },

  /* Header */
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
  logoEmoji: { fontSize: '2rem', lineHeight: 1 },
  logoText: { display: 'flex', flexDirection: 'column', gap: '2px' },
  brandName: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '1.5rem',
    color: '#c9a84c',
    letterSpacing: '0.02em',
    lineHeight: 1,
  },
  subtitle: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.6rem',
    color: '#a0a0b8',
    letterSpacing: '0.18em',
  },
  headerBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.65rem',
    color: '#c9a84c',
    border: '1px solid #c9a84c',
    borderRadius: '4px',
    padding: '4px 10px',
    letterSpacing: '0.1em',
  },

  /* Upload panel */
  uploadPanel: {
    padding: '2rem 2rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  /* Analyze button */
  analyzeBtn: (disabled) => ({
    width: '100%',
    padding: '0.9rem 2rem',
    background: disabled
      ? '#e4ddd0'
      : 'linear-gradient(135deg, #1a1510, #2d2418)',
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
  progressText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.72rem',
    color: '#6b6b80',
    letterSpacing: '0.06em',
    textAlign: 'center',
    minHeight: '1rem',
  },

  /* Two-column results */
  resultsSection: {
    flex: 1,
    display: 'flex',
    padding: '2rem',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },

  /* Sidebar – 300 px */
  sidebar: {
    width: '300px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sidebarCard: {
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #e4ddd0',
    padding: '1.25rem',
  },
  sidebarCardTitle: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.65rem',
    letterSpacing: '0.14em',
    color: '#a0a0b8',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
  },
  riskRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
    borderBottom: '1px solid #f0ebe3',
  },
  riskLabel: { fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#3a3a4a' },
  scoreCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '4px solid #c9a84c',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.75rem',
  },
  scoreNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.6rem',
    color: '#1a1a2e',
    lineHeight: 1,
  },
  scoreLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.55rem',
    color: '#a0a0b8',
    letterSpacing: '0.08em',
  },
  scoreVerdict: {
    fontFamily: "'Lora', serif",
    fontSize: '0.8rem',
    color: '#6b6b80',
    textAlign: 'center',
  },

  /* Main content */
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  clauseCard: {
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #e4ddd0',
    padding: '1.25rem 1.5rem',
  },
  clauseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  clauseTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    color: '#1a1a2e',
    fontWeight: 700,
  },
  clauseBody: {
    fontFamily: "'Lora', serif",
    fontSize: '0.85rem',
    color: '#6b6b80',
    lineHeight: 1.6,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '3rem',
    background: '#fff',
    borderRadius: '10px',
    border: '1px dashed #e4ddd0',
  },
  emptyIcon: { fontSize: '2.5rem', opacity: 0.3 },
  emptyText: { fontFamily: "'Lora', serif", fontSize: '0.9rem', color: '#a0a0b8' },
}

function riskBadgeStyle(risk) {
  const color = RISK_COLORS[risk] ?? '#a0a0b8'
  return {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.7rem',
    color,
    border: `1px solid ${color}`,
    borderRadius: '4px',
    padding: '2px 8px',
    textTransform: 'capitalize',
    flexShrink: 0,
  }
}

function RiskBadge({ risk }) {
  return <span style={riskBadgeStyle(risk)}>{risk}</span>
}

function ScoreCard({ results }) {
  const score = results
    ? results.overallRisk === 'high' ? 'High'
      : results.overallRisk === 'medium' ? 'Med'
      : 'Low'
    : '—'

  return (
    <div style={s.sidebarCard}>
      <p style={s.sidebarCardTitle}>Risk Score</p>
      <div style={s.scoreCircle}>
        <span style={s.scoreNum}>{score}</span>
        {results && <span style={s.scoreLabel}>RISK</span>}
      </div>
      <p style={s.scoreVerdict}>
        {results ? results.riskSummary || results.summary : 'Upload a contract to see your score'}
      </p>
    </div>
  )
}

function ClauseBreakdown({ results }) {
  const counts = { High: 0, Medium: 0, Low: 0 }
  if (results) {
    for (const c of results.clauses ?? []) {
      const key = c.risk ? c.risk.charAt(0).toUpperCase() + c.risk.slice(1) : null
      if (key && key in counts) counts[key]++
    }
  }

  return (
    <div style={s.sidebarCard}>
      <p style={s.sidebarCardTitle}>Clause Breakdown</p>
      {['High', 'Medium', 'Low'].map(level => (
        <div key={level} style={s.riskRow}>
          <span style={s.riskLabel}>{level} Risk</span>
          <RiskBadge risk={level.toLowerCase()} />
        </div>
      ))}
    </div>
  )
}

function ClauseCard({ clause }) {
  const borderColor = RISK_COLORS[clause.risk] ?? '#e4ddd0'
  return (
    <div style={{ ...s.clauseCard, borderLeft: `4px solid ${borderColor}` }}>
      <div style={s.clauseHeader}>
        <span style={s.clauseTitle}>{clause.title}</span>
        <RiskBadge risk={clause.risk} />
      </div>
      <p style={s.clauseBody}>{clause.explanation || clause.text}</p>
    </div>
  )
}

export default function App() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const disabled = files.length === 0 || loading

  async function handleAnalyze() {
    if (disabled) return
    setLoading(true)
    setError(null)
    setProgress(files.length > 5 ? 'Preparing analysis…' : '')
    try {
      const data = await analyzeContract(files, setProgress)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const buttonLabel = loading
    ? progress || 'Analyzing Contract…'
    : 'Analyze Contract'

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logoGroup}>
          <span style={s.logoEmoji}>⚖️</span>
          <div style={s.logoText}>
            <span style={s.brandName}>PocketLawyer</span>
            <span style={s.subtitle}>CONTRACT RISK ANALYZER</span>
          </div>
        </div>
        <span style={s.headerBadge}>AI POWERED</span>
      </header>

      {/* Upload + Analyze */}
      <div style={s.uploadPanel}>
        <UploadZone files={files} onFilesChange={setFiles} />

        <button style={s.analyzeBtn(disabled)} disabled={disabled} onClick={handleAnalyze}>
          {loading && <span className="spinner" />}
          {buttonLabel}
        </button>

        {(progress || error) && (
          <p style={{ ...s.progressText, color: error ? '#e05252' : '#6b6b80' }}>
            {error || progress}
          </p>
        )}
      </div>

      {/* Two-column results */}
      <div style={s.resultsSection}>
        {/* 300 px sidebar */}
        <aside style={s.sidebar}>
          <ScoreCard results={results} />
          <ClauseBreakdown results={results} />
        </aside>

        {/* Main content */}
        <main style={s.mainContent}>
          {results?.clauses?.length > 0 ? (
            results.clauses.map(c => <ClauseCard key={c.id} clause={c} />)
          ) : (
            <div style={s.emptyState}>
              <span style={s.emptyIcon}>⚖️</span>
              <span style={s.emptyText}>
                {loading ? 'Analysing your contract…' : 'Upload a contract to see the full analysis'}
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
