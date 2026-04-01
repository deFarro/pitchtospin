import Fastify from 'fastify'
import cors from '@fastify/cors'
import 'dotenv/config'
import { agentRoutes } from './routes/agent.js'
import { analyticsRoutes } from './routes/analytics.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await app.register(agentRoutes, { prefix: '/api/agent' })
await app.register(analyticsRoutes, { prefix: '/api/analytics' })

app.get('/health', async () => ({ status: 'ok' }))

const port = Number(process.env.PORT) || 3000

try {
  await app.listen({ port, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
