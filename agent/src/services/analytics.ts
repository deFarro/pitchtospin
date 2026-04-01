import { createClient } from '@clickhouse/client'

const clickhouse = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  database: process.env.CLICKHOUSE_DATABASE ?? 'pitchtospin',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})

export async function getOverview() {
  const result = await clickhouse.query({
    query: `
      SELECT
        count() AS totalTraces,
        avg(latency_ms) AS avgLatencyMs,
        sum(total_tokens) AS totalTokens,
        countIf(error != '') / count() AS errorRate
      FROM traces
    `,
    format: 'JSONEachRow',
  })

  const rows = await result.json<{
    totalTraces: number
    avgLatencyMs: number
    totalTokens: number
    errorRate: number
  }>()

  return rows[0] ?? { totalTraces: 0, avgLatencyMs: 0, totalTokens: 0, errorRate: 0 }
}

export async function getLatencyHistogram() {
  const result = await clickhouse.query({
    query: `
      SELECT
        multiIf(
          latency_ms < 500, '<500ms',
          latency_ms < 1000, '500-1000ms',
          latency_ms < 2000, '1-2s',
          latency_ms < 5000, '2-5s',
          '>5s'
        ) AS bucket,
        count() AS count
      FROM traces
      GROUP BY bucket
      ORDER BY min(latency_ms)
    `,
    format: 'JSONEachRow',
  })

  return result.json<{ bucket: string; count: number }>()
}
