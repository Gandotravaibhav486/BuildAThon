const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f1ea',
    display: 'flex',
    flexDirection: 'column',
  },

  /* ── Header ── */
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
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoEmoji: {
    fontSize: '2rem',
    lineHeight: 1,
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
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
    lineHeight: 1,
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

  /* ── Upload zone ── */
  uploadSection: {
    padding: '2.5rem 2rem 0',
  },
  uploadBox: {
    border: '2px dashed #c9a84c',
    borderRadius: '12px',
    background: 'rgba(201,168,76,0.05)',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  uploadIcon: {
    fontSize: '2.5rem',
  },
  uploadTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.2rem',
    color: '#1a1a2e',
    fontWeight: 700,
  },
  uploadHint: {
    fontFamily: "'Lora', serif",
    fontSize: '0.85rem',
    color: '#6b6b80',
  },
  uploadMono: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.7rem',
    color: '#a0a0b8',
    letterSpacing: '0.08em',
  },
  analyseBtn: {
    marginTop: '1.25rem',
    background: '#1a1a2e',
    color: '#c9a84c',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 2rem',
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.8rem',
    letterSpacing: '0.12em',
    cursor: 'pointer',
  },

  /* ── Two-column results ── */
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
  riskLabel: {
    fontFamily: "'Lora', serif",
    fontSize: '0.85rem',
    color: '#3a3a4a',
  },
  riskBadge: (color) => ({
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.7rem',
    color,
    border: `1px solid ${color}`,
    borderRadius: '4px',
    padding: '2px 8px',
  }),
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
    borderLeft: '4px solid transparent',
  },
  clauseCardHigh: {
    borderLeftColor: '#e05252',
  },
  clauseCardMed: {
    borderLeftColor: '#e6a817',
  },
  clauseCardLow: {
    borderLeftColor: '#4caf7d',
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
  emptyIcon: {
    fontSize: '2.5rem',
    opacity: 0.3,
  },
  emptyText: {
    fontFamily: "'Lora', serif",
    fontSize: '0.9rem',
    color: '#a0a0b8',
  },
}

const RISK_COLORS = { High: '#e05252', Medium: '#e6a817', Low: '#4caf7d' }

function RiskBadge({ level }) {
  return <span style={styles.riskBadge(RISK_COLORS[level])}>{level}</span>
}

function ScoreCard() {
  return (
    <div style={styles.sidebarCard}>
      <p style={styles.sidebarCardTitle}>Risk Score</p>
      <div style={styles.scoreCircle}>
        <span style={styles.scoreNum}>—</span>
        <span style={styles.scoreLabel}>/100</span>
      </div>
      <p style={styles.scoreVerdict}>Upload a contract to see your score</p>
    </div>
  )
}

function ClauseBreakdown() {
  return (
    <div style={styles.sidebarCard}>
      <p style={styles.sidebarCardTitle}>Clause Breakdown</p>
      {['High', 'Medium', 'Low'].map((level) => (
        <div key={level} style={styles.riskRow}>
          <span style={styles.riskLabel}>{level} Risk</span>
          <RiskBadge level={level} />
        </div>
      ))}
    </div>
  )
}

function ClauseCardPlaceholder({ risk, title, excerpt }) {
  const borderStyle =
    risk === 'High'
      ? styles.clauseCardHigh
      : risk === 'Medium'
      ? styles.clauseCardMed
      : styles.clauseCardLow

  return (
    <div style={{ ...styles.clauseCard, ...borderStyle }}>
      <div style={styles.clauseHeader}>
        <span style={styles.clauseTitle}>{title}</span>
        <RiskBadge level={risk} />
      </div>
      <p style={styles.clauseBody}>{excerpt}</p>
    </div>
  )
}

export default function App() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <span style={styles.logoEmoji}>⚖️</span>
          <div style={styles.logoText}>
            <span style={styles.brandName}>PocketLawyer</span>
            <span style={styles.subtitle}>CONTRACT RISK ANALYZER</span>
          </div>
        </div>
        <span style={styles.headerBadge}>AI POWERED</span>
      </header>

      {/* Upload */}
      <div style={styles.uploadSection}>
        <div style={styles.uploadBox}>
          <span style={styles.uploadIcon}>📄</span>
          <span style={styles.uploadTitle}>Drop your contract here</span>
          <span style={styles.uploadHint}>PDF or plain text — up to 50 pages</span>
          <span style={styles.uploadMono}>SUPPORTED: PDF · TXT · DOCX</span>
          <button style={styles.analyseBtn}>ANALYSE CONTRACT</button>
        </div>
      </div>

      {/* Two-column results */}
      <div style={styles.resultsSection}>
        {/* 300 px sidebar */}
        <aside style={styles.sidebar}>
          <ScoreCard />
          <ClauseBreakdown />
        </aside>

        {/* Main content */}
        <main style={styles.mainContent}>
          <ClauseCardPlaceholder
            risk="High"
            title="Unlimited Liability Clause"
            excerpt="Placeholder — clause text will appear here once a contract is analysed."
          />
          <ClauseCardPlaceholder
            risk="Medium"
            title="Auto-Renewal Term"
            excerpt="Placeholder — clause text will appear here once a contract is analysed."
          />
          <ClauseCardPlaceholder
            risk="Low"
            title="Governing Law"
            excerpt="Placeholder — clause text will appear here once a contract is analysed."
          />
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>⚖️</span>
            <span style={styles.emptyText}>Upload a contract to see the full analysis</span>
          </div>
        </main>
      </div>
    </div>
  )
}
