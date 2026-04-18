const SYSTEM_PROMPT = `You are an expert legal analyst with deep knowledge of Indian contract law, including the Indian Contract Act 1872, Transfer of Property Act, Specific Relief Act, Negotiable Instruments Act, IT Act, and sector-specific regulations.

The user will give you a contract document and ask you to search for a specific term, clause, reference, keyword, or legal concept. Your job is to:
1. Locate all occurrences in the document
2. Quote the exact text verbatim
3. Explain in plain English what was found
4. If the query is a statute/act/section reference, provide its legal context
5. State the practical implications for the reader
6. Give a concrete recommendation

Return ONLY valid JSON — no prose, no markdown fences.`

function extractJSON(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON found in search response')
  return JSON.parse(text.slice(start, end + 1))
}

export async function searchContract(files, query) {
  const content = []

  for (const { file, data } of files) {
    if (file.type === 'application/pdf') {
      content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } })
    } else {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } })
    }
  }

  content.push({
    type: 'text',
    text: `Search this contract for: "${query}"

Return this exact JSON shape (all fields required):
{
  "found": true | false,
  "query": "${query}",
  "quotes": ["<verbatim quote 1 from the document>", "<quote 2 if multiple occurrences>"],
  "plainEnglish": "<plain language explanation of what was found, or what is absent if not found>",
  "legalContext": "<if query is a statute, act, section or legal term: its legal meaning and relevance in Indian law — otherwise empty string>",
  "implications": "<practical implications of this finding for the reader — what it means for their rights and obligations>",
  "recommendation": "<specific actionable advice — what should the reader do or watch out for>"
}`,
  })

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Search failed: ${res.statusText}`)
  }

  const { text } = await res.json()
  return extractJSON(text)
}
