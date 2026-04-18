function buildSystemPrompt(results) {
  if (!results) {
    return `You are PocketLawyer Assistant, an expert AI legal analyst specialising in Indian contract law (Indian Contract Act 1872, Transfer of Property Act, Specific Relief Act, Negotiable Instruments Act, IT Act 2000, and sector-specific regulations).

No contract has been loaded yet. Answer general legal questions and help the user understand what to look for in contracts.`
  }

  const clauseLines = (results.clauses ?? []).map(c =>
    `§${String(c.id).padStart(2, '0')} [${c.risk.toUpperCase()}] ${c.title}\n  Plain English: ${c.plainEnglish}\n  Risk Reason: ${c.riskReason}\n  Recommendation: ${c.recommendation}`
  ).join('\n\n')

  const refLines = (results.hiddenReferences ?? []).map(r =>
    `  • ${r.ref} — ${r.explanation}`
  ).join('\n')

  return `You are PocketLawyer Assistant, an expert AI legal analyst specialising in Indian contract law.

CONTRACT ON FILE: "${results.title}"
OVERALL RISK: ${(results.overallRisk ?? 'unknown').toUpperCase()}
SUMMARY: ${results.summary ?? ''}
RISK ASSESSMENT: ${results.riskSummary ?? ''}

━━ CLAUSES (${results.clauses?.length ?? 0} total) ━━
${clauseLines || 'None extracted.'}

━━ HIDDEN LEGAL REFERENCES ━━
${refLines || 'None detected.'}

Your role:
• Answer questions about this specific contract using the clause data above
• Explain clauses in plain language a non-lawyer can act on
• Suggest negotiation tactics when asked
• Cite specific clauses by number (e.g. §03 — Payment Terms) when relevant
• Flag if a question touches something outside this contract's scope
• Be concise, direct, and practical — no unnecessary legalese
• Always consider the Indian legal and cultural context`
}

export async function sendChatMessage(history, results) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: buildSystemPrompt(results),
      messages: history.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Chat failed: ${res.statusText}`)
  }

  const { text } = await res.json()
  return text
}
