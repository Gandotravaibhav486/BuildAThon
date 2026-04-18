import 'dotenv/config'
import express from 'express'
import { analyzeHandler } from './api/analyze.js'

const app = express()
app.use(express.json({ limit: '50mb' }))

app.post('/api/analyze', analyzeHandler)

const PORT = process.env.API_PORT ?? 3001
app.listen(PORT, () => console.log(`API server → http://localhost:${PORT}`))
