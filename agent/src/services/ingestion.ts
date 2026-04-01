export interface TraceEvent {
  traceId: string
  userMessage: string
  latencyMs: number
  totalTokens: number
  error: string | null
  timestamp: string
}

const INGESTION_URL =
  process.env.INGESTION_SERVICE_URL ?? 'http://localhost:8080'

export function emitTraceEvent(event: TraceEvent): void {
  fetch(`${INGESTION_URL}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch((err) => {
    console.error('Failed to emit trace event:', err)
  })
}
