const RISK_ORDER = { low: 0, medium: 1, high: 2 }

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

  content.push({
    type: 'text',
    text: `This is part ${batchNum} of ${totalBatches} of the contract. Extract ALL clauses and hidden references visible in these pages only. Return valid JSON only, no markdown: { "title": string, "summary": string, "overallRisk": "low"|"medium"|"high", "riskSummary": string, "clauses": [{ "id": number, "title": string, "text": string, "risk": "low"|"medium"|"high", "explanation": string }], "hiddenReferences": [{ "ref": string, "explanation": string }] }`,
  })

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: `You are an expert legal analyst specialising in Indian contract law. This is part ${batchNum} of ${totalBatches} of the contract. Extract ALL clauses and hidden references visible in these pages only.`,
      content,
    }),
  })

  if (!res.ok) throw new Error(`Batch ${batchNum} failed: ${res.statusText}`)
  return res.json()
}

function mergeResults(results) {
  const overallRisk = results.reduce(
    (max, r) => (RISK_ORDER[r.overallRisk] > RISK_ORDER[max] ? r.overallRisk : max),
    'low'
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
