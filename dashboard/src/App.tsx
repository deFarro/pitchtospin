import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface AnalyticsOverview {
  totalTraces: number
  avgLatencyMs: number
  totalTokens: number
  errorRate: number
}

interface LatencyBucket {
  bucket: string
  count: number
}

function App() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [latencyData, setLatencyData] = useState<LatencyBucket[]>([])

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((r) => r.json())
      .then(setOverview)
      .catch(() => {})

    fetch('/api/analytics/latency-histogram')
      .then((r) => r.json())
      .then(setLatencyData)
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          PitchToSpin — Analytics
        </h1>
        <p className="text-sm text-zinc-500">
          LLM observability & agent performance
        </p>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Traces"
            value={overview?.totalTraces ?? '—'}
          />
          <StatCard
            label="Avg Latency"
            value={overview ? `${overview.avgLatencyMs.toFixed(0)}ms` : '—'}
          />
          <StatCard
            label="Total Tokens"
            value={overview?.totalTokens.toLocaleString() ?? '—'}
          />
          <StatCard
            label="Error Rate"
            value={overview ? `${(overview.errorRate * 100).toFixed(1)}%` : '—'}
          />
        </section>

        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-medium mb-4">Latency Distribution</h2>
          {latencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="bucket" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-zinc-600">
              No data yet — start chatting with the agent
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <p className="text-sm text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

export default App
