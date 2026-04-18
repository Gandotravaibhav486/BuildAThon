const RISK_ORDER = { info: 0, low: 1, medium: 2, high: 3 }

const SYSTEM_PROMPT = `You are an expert legal analyst specialising in Indian contract law (Indian Contract Act 1872, Transfer of Property Act, Specific Relief Act, Consumer Protection Act, IT Act, and sector-specific regulations).

Your job is to analyse contract documents page-by-page and extract a COMPLETE list of every identifiable clause or provision — not just the risky ones. Include informational clauses too.

For every clause you find:
• Assign ONE risk level: "high" (could cause serious harm/loss), "medium" (noteworthy, needs attention), "low" (standard but worth knowing), or "info" (purely informational, no risk)
• Quote the original text verbatim or as a close paraphrase
• Rewrite it in plain English a non-lawyer can understand
• Explain WHY you assigned that risk level
• Give a concrete, actionable recommendation
• List any cross-references this clause makes (e.g. "See Schedule 2", "as per Clause 8.3")

Also detect HIDDEN LEGAL REFERENCES — citations embedded in the text that a non-lawyer would overlook:
• References to external statutes (e.g. "Section 138 of NI Act", "Article 226 of Constitution")
• References to standard schedules, annexures, exhibits not reproduced in this excerpt
• Industry-standard clauses cited by name only (e.g. "FIDIC conditions apply")
• Defined terms that silently import obligations from elsewhere

Return ONLY valid JSON — no prose, no markdown fences, no explanation outside the JSON object.`

const USER_PROMPT = (batchNum, totalBatches) => `\
This is part ${batchNum} of ${totalBatches} of the contract. \
Extract ALL clauses and ALL hidden references visible on these pages only.

Return this exact JSON shape (all fields required):
{
  "title": "<contract title or inferred type>",
  "summary": "<2–3 sentence overview of what this contract does>",
  "overallRisk": "<high|medium|low|info>",
  "riskSummary": "<plain-English overall risk assessment, 1–2 sentences>",
  "clauses": [
    {
      "id": 1,
      "title": "<short clause name>",
      "originalText": "<verbatim or close paraphrase from the document>",
      "plainEnglish": "<what this means in plain language>",
      "risk": "<high|medium|low|info>",
      "riskReason": "<why this risk level was assigned>",
      "recommendation": "<what the reader should do or watch out for>",
      "relatedRefs": ["<e.g. Schedule 1>", "<e.g. Clause 9.2>"]
    }
  ],
  "hiddenReferences": [
    {
      "ref": "<e.g. Section 73 of Indian Contract Act 1872>",
      "explanation": "<what this reference means and why it matters to the reader>"
    }
  ]
}`

function extractJSON(text) {
  // Strip common markdown fences and leading prose before the first {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON object found in model response')
  }
  return JSON.parse(text.slice(start, end + 1))
}

async function analyzeBatch(files, batchNum, totalBatches) {
  const content = []

  for (const { file, data } of files) {
    if (file.type === 'application/pdf') {
      content.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data },
      })
    } else {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data },
      })
    }
  }

  content.push({ type: 'text', text: USER_PROMPT(batchNum, totalBatches) })

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      max_tokens: 8192,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Batch ${batchNum} failed: ${res.statusText}`)
  }

  const { text } = await res.json()
  return extractJSON(text)
}

function mergeResults(results) {
  const overallRisk = results.reduce(
    (max, r) => (RISK_ORDER[r.overallRisk] > RISK_ORDER[max] ? r.overallRisk : max),
    'info'
  )

  const seenClauses = new Set()
  let id = 1
  const clauses = []
  for (const r of results) {
    for (const c of r.clauses ?? []) {
      const key = c.title?.toLowerCase().trim()
      if (key && !seenClauses.has(key)) {
        seenClauses.add(key)
        clauses.push({ ...c, id: id++ })
      }
    }
  }

  const seenRefs = new Set()
  const hiddenReferences = []
  for (const r of results) {
    for (const ref of r.hiddenReferences ?? []) {
      const key = ref.ref?.toLowerCase().trim()
      if (key && !seenRefs.has(key)) {
        seenRefs.add(key)
        hiddenReferences.push(ref)
      }
    }
  }

  return {
    title: results[0]?.title ?? 'Contract Analysis',
    summary: results.map(r => r.summary).filter(Boolean).join(' '),
    overallRisk,
    riskSummary: results.map(r => r.riskSummary).filter(Boolean).join(' '),
    clauses,
    hiddenReferences,
  }
}

export async function analyzeContract(files, onProgress) {
  const CHUNK = 5

  if (files.length <= CHUNK) {
    return analyzeBatch(files, 1, 1)
  }

  const chunks = []
  for (let i = 0; i < files.length; i += CHUNK) {
    chunks.push(files.slice(i, i + CHUNK))
  }

  const results = []
  for (let i = 0; i < chunks.length; i++) {
    const start = i * CHUNK + 1
    const end = Math.min(start + CHUNK - 1, files.length)
    onProgress(`Analyzing pages ${start}–${end} of ${files.length} (batch ${i + 1}/${chunks.length})…`)
    results.push(await analyzeBatch(chunks[i], i + 1, chunks.length))
  }

  onProgress('')
  return mergeResults(results)
}
