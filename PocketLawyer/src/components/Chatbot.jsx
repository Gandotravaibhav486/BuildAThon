import { useState, useEffect, useRef } from 'react'
import { sendChatMessage } from '../utils/chatContract.js'

const SUGGESTIONS = [
  "What's the biggest risk in this contract?",
  "Can I negotiate any of these clauses?",
  "Are there hidden penalties I should know about?",
  "What are my key obligations?",
  "Is this contract standard for India?",
  "Which clauses protect me the most?",
]

/* ── Small sub-components ────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.6rem 0.75rem' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`typing-dot dot-${i}`}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }}
        />
      ))}
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '0.65rem' }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#c9a84c22', border: '1px solid #c9a84c44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginRight: '0.5rem', alignSelf: 'flex-end' }}>
          ⚖
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '0.6rem 0.85rem',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
        border: isUser ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Lora', serif",
        fontSize: '0.8rem',
        color: isUser ? '#e8d9b0' : '#c8c0b0',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────────── */
export default function Chatbot({ results, open, onToggle, triggerMessage, onTriggerHandled }) {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const highRiskCount = results?.clauses?.filter(c => c.risk === 'high').length ?? 0

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* Focus input when opened */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  /* Handle pre-filled trigger from clause cards */
  useEffect(() => {
    if (triggerMessage && open) {
      handleSend(triggerMessage)
      onTriggerHandled?.()
    }
  }, [triggerMessage, open])

  async function handleSend(text) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    try {
      const reply = await sendChatMessage(next, results)
      setMessages(m => [...m, { id: Date.now() + 1, role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(m => [...m, { id: Date.now() + 1, role: 'assistant', content: `⚠ ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  /* ── FAB ── */
  const fab = (
    <button
      onClick={() => onToggle(!open)}
      title="PocketLawyer Assistant"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1a1510, #2d2418)',
        border: '2px solid #c9a84c',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        zIndex: 1000,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(201,168,76,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)' }}
    >
      <span style={{ lineHeight: 1 }}>{open ? '✕' : '⚖'}</span>

      {/* High-risk badge */}
      {!open && highRiskCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: '#e05252',
          color: '#fff',
          borderRadius: '99px',
          minWidth: '18px',
          height: '18px',
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.58rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
          border: '2px solid #0f0f1a',
        }}>
          {highRiskCount}
        </span>
      )}
    </button>
  )

  /* ── Chat panel ── */
  const panel = open && (
    <div
      className="chat-panel"
      style={{
        position: 'fixed',
        bottom: '6rem',
        right: '2rem',
        width: '380px',
        height: '520px',
        background: '#0f0f1a',
        border: '1px solid rgba(201,168,76,0.4)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
      }}
    >
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '0.875rem 1rem', borderBottom: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <span style={{ fontSize: '1rem' }}>⚖</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', color: '#c9a84c', fontWeight: 700, lineHeight: 1 }}>
            PocketLawyer Assistant
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', color: '#6b6b80', letterSpacing: '0.1em', marginTop: '2px' }}>
            {results ? `${results.title ?? 'CONTRACT LOADED'} · ${results.clauses?.length ?? 0} CLAUSES` : 'NO CONTRACT LOADED'}
          </p>
        </div>
        <button
          onClick={() => onToggle(false)}
          style={{ background: 'transparent', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '1rem', padding: '4px', borderRadius: '4px', lineHeight: 1 }}
        >−</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>

        {/* Welcome message */}
        {messages.length === 0 && !loading && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#c9a84c22', border: '1px solid #c9a84c44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>⚖</div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px 14px 14px 4px', padding: '0.6rem 0.85rem', maxWidth: '78%' }}>
                <p style={{ fontFamily: "'Lora', serif", fontSize: '0.8rem', color: '#c8c0b0', lineHeight: 1.65, margin: 0 }}>
                  {results
                    ? `I've read "${results.title}". Ask me anything about its clauses, risks, or your rights.`
                    : `Hello! Upload and analyse a contract, then ask me anything about it.`}
                </p>
              </div>
            </div>

            {/* Suggested questions */}
            <div style={{ paddingLeft: '2.25rem' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', color: '#4a4a5a', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SUGGESTED QUESTIONS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {SUGGESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: '0.75rem',
                      color: '#9a90a0',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.color = '#c9a84c'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9a90a0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map(m => <Message key={m.id} msg={m} />)}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#c9a84c22', border: '1px solid #c9a84c44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>⚖</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px 14px 14px 4px' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0f0f1a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about any clause, risk, or legal term…"
            rows={1}
            style={{
              flex: 1,
              fontFamily: "'Lora', serif",
              fontSize: '0.8rem',
              color: '#d4c9b0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.55rem 0.75rem',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
              maxHeight: '80px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.5)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? '#c9a84c' : 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '8px',
              padding: '0 0.85rem',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              color: input.trim() && !loading ? '#1a1510' : '#4a4a5a',
              fontSize: '1rem',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >▶</button>
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', color: '#3a3a4a', letterSpacing: '0.08em', marginTop: '0.4rem', textAlign: 'center' }}>
          ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
        </p>
      </div>
    </div>
  )

  return (
    <>
      {panel}
      {fab}
    </>
  )
}
