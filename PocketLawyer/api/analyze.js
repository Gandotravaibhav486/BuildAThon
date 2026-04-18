import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function analyzeHandler(req, res) {
  const { system, messages, max_tokens = 4096 } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      system,
      messages,
    })

    res.json({ text: response.content[0]?.text ?? '' })
  } catch (err) {
    console.error('[analyze]', err?.message ?? err)
    res.status(err?.status ?? 500).json({ error: err?.message ?? 'Analysis failed' })
  }
}
